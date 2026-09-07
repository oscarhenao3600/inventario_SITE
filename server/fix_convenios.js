const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Helper to load MongoDB URI from .env or fallback to default local configuration
function getMongoUri() {
  try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      let rootUser = 'admin_inventario';
      let dbName = 'inventario_educativo';
      let mongoUriLine = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('MONGO_ROOT_USER=')) {
          rootUser = trimmed.split('=')[1].trim();
        }
        if (trimmed.startsWith('DB_NAME=')) {
          dbName = trimmed.split('=')[1].trim();
        }
        if (trimmed.startsWith('MONGODB_URI=')) {
          mongoUriLine = trimmed.split('=')[1].trim();
        }
      }

      if (mongoUriLine) {
        let val = mongoUriLine;
        val = val.replace('${MONGO_ROOT_USER}', rootUser);
        val = val.replace('${DB_NAME}', dbName);
        if (val.includes('@mongo:27017')) {
          val = val.replace('@mongo:27017', '@localhost:49152');
        }
        return val;
      }
    }
  } catch (err) {
    console.warn('Could not parse .env file, using fallback local URI. Error:', err.message);
  }
  return 'mongodb://admin_inventario:38TM4S5J1-X2P1LQK93_%23%24%21@localhost:49152/inventario_educativo?authSource=admin';
}

async function run() {
  const isCommit = process.argv.includes('--commit');
  console.log(`Execution Mode: ${isCommit ? 'COMMIT (Writing to DB)' : 'DRY RUN (Simulation)'}`);

  const uri = process.env.MONGODB_URI || getMongoUri();
  console.log(`Connecting to: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Hide password in logs

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('inventario_educativo');
    const collection = db.collection('dispositivos');

    console.log('Retrieving all devices from database...');
    const allDevices = await collection.find({}).toArray();
    console.log(`Retrieved ${allDevices.length} devices.`);

    const excludedTypes = ['Silla De Mesa interactiva', 'Mesa Interactiva Tactil'];

    // 1. Precalculate frequency of agreements (convenios) at Sede and Institution levels
    // (excluding Silla De Mesa interactiva and Mesa Interactiva Tactil as requested)
    const instConvenioFrequencies = {};
    const sedeConvenioFrequencies = {};

    for (const d of allDevices) {
      if (excludedTypes.includes(d.dispositivo)) continue;

      const inst = (d.institucion || '').trim();
      const sede = (d.sede || '').trim();
      const conv = (d.convenio || '').trim();

      if (conv) {
        // Institution frequency
        if (!instConvenioFrequencies[inst]) instConvenioFrequencies[inst] = {};
        instConvenioFrequencies[inst][conv] = (instConvenioFrequencies[inst][conv] || 0) + 1;

        // Sede frequency
        const sedeKey = `${inst} ||| ${sede}`;
        if (!sedeConvenioFrequencies[sedeKey]) sedeConvenioFrequencies[sedeKey] = {};
        sedeConvenioFrequencies[sedeKey][conv] = (sedeConvenioFrequencies[sedeKey][conv] || 0) + 1;
      }
    }

    // Helper to find the most frequent convenio
    function getMostFrequent(freqMap) {
      if (!freqMap) return null;
      let maxCount = 0;
      let bestConv = null;
      for (const [conv, count] of Object.entries(freqMap)) {
        if (count > maxCount) {
          maxCount = count;
          bestConv = conv;
        }
      }
      return bestConv;
    }

    // 2. Group all devices by: institucion + sede + aula
    const groups = {};
    for (const d of allDevices) {
      const inst = (d.institucion || '').trim();
      const sede = (d.sede || '').trim();
      const aula = (d.aula || '').trim();
      const key = `${inst} ||| ${sede} ||| ${aula}`;

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(d);
    }

    const priorityList = [
      'Pantalla Interactiva Táctil',
      'Servidor Portable de Aula SITE Sistema Cloud',
      'Soporte Electrónico Pantalla Interactiva Táctil',
      'Carro Cargador de Tabletas',
      'Tablet Para Estudiantes'
    ];

    const bulkUpdates = [];
    const stats = {
      resolvedByPriority: 0,
      resolvedByOtherDevice: 0,
      resolvedBySedeFallback: 0,
      resolvedByInstFallback: 0,
      unresolved: 0,
      totalDevicesUpdated: 0,
      skippedExcluded: 0
    };

    const resolutionDetails = [];

    // 3. For each group, determine the correct agreement and prepare updates
    for (const [groupKey, groupDevices] of Object.entries(groups)) {
      // Check if there are devices in this group that need an agreement (excluding Mesa and Silla)
      const devicesNeedingUpdate = groupDevices.filter(d => 
        !excludedTypes.includes(d.dispositivo) && 
        (!d.convenio || d.convenio.trim() === '')
      );

      // Log skipped count for excluded devices
      const excludedNeedingUpdate = groupDevices.filter(d => 
        excludedTypes.includes(d.dispositivo) && 
        (!d.convenio || d.convenio.trim() === '')
      );
      stats.skippedExcluded += excludedNeedingUpdate.length;

      if (devicesNeedingUpdate.length === 0) continue;

      let chosenConvenio = null;
      let resolutionMethod = '';

      // Method 1: Check priority list of device types
      for (const type of priorityList) {
        const matchingDevice = groupDevices.find(d => 
          d.dispositivo === type && 
          d.convenio && 
          d.convenio.trim() !== ''
        );
        if (matchingDevice) {
          chosenConvenio = matchingDevice.convenio.trim();
          resolutionMethod = `Priority Device (${type})`;
          stats.resolvedByPriority++;
          break;
        }
      }

      // Method 2: Check other device types in the same group (except excluded ones)
      if (!chosenConvenio) {
        const otherDevice = groupDevices.find(d => 
          !excludedTypes.includes(d.dispositivo) && 
          d.convenio && 
          d.convenio.trim() !== ''
        );
        if (otherDevice) {
          chosenConvenio = otherDevice.convenio.trim();
          resolutionMethod = `Other Device in Group (${otherDevice.dispositivo})`;
          stats.resolvedByOtherDevice++;
        }
      }

      // Method 3: Fallback to Sede level (most frequent convenio in the same Sede)
      if (!chosenConvenio) {
        const inst = groupDevices[0].institucion.trim();
        const sede = groupDevices[0].sede.trim();
        const sedeKey = `${inst} ||| ${sede}`;
        const bestSedeConv = getMostFrequent(sedeConvenioFrequencies[sedeKey]);
        if (bestSedeConv) {
          chosenConvenio = bestSedeConv;
          resolutionMethod = `Sede Fallback (${sede})`;
          stats.resolvedBySedeFallback++;
        }
      }

      // Method 4: Fallback to Institution level (most frequent convenio in the same Institution)
      if (!chosenConvenio) {
        const inst = groupDevices[0].institucion.trim();
        const bestInstConv = getMostFrequent(instConvenioFrequencies[inst]);
        if (bestInstConv) {
          chosenConvenio = bestInstConv;
          resolutionMethod = `Institution Fallback (${inst})`;
          stats.resolvedByInstFallback++;
        }
      }

      if (chosenConvenio) {
        // Prepare bulk write operations for devices in the group needing update
        for (const device of devicesNeedingUpdate) {
          bulkUpdates.push({
            updateOne: {
              filter: { _id: device._id },
              update: { 
                $set: { 
                  convenio: chosenConvenio,
                  updatedAt: new Date().toISOString(),
                  updatedBy: 'antigravity_fix'
                } 
              }
            }
          });
          stats.totalDevicesUpdated++;
        }

        resolutionDetails.push({
          groupKey,
          devicesUpdated: devicesNeedingUpdate.length,
          chosenConvenio,
          method: resolutionMethod
        });
      } else {
        stats.unresolved += devicesNeedingUpdate.length;
        console.warn(`[UNRESOLVED GROUP] No convenio found at any level for group: "${groupKey}" (${devicesNeedingUpdate.length} devices need update)`);
      }
    }

    console.log('\n--- Assignment Statistics ---');
    console.log(`Groups resolved by priority device type:       ${stats.resolvedByPriority}`);
    console.log(`Groups resolved by other device types:         ${stats.resolvedByOtherDevice}`);
    console.log(`Groups resolved by Sede level fallback:        ${stats.resolvedBySedeFallback}`);
    console.log(`Groups resolved by Institution level fallback: ${stats.resolvedByInstFallback}`);
    console.log(`Total devices to be updated:                  ${stats.totalDevicesUpdated}`);
    console.log(`Excluded devices skipped:                     ${stats.skippedExcluded}`);
    console.log(`Devices with missing convenio left unresolved: ${stats.unresolved}`);

    console.log('\nSample of resolutions:');
    console.log(JSON.stringify(resolutionDetails.slice(0, 10), null, 2));

    if (isCommit && bulkUpdates.length > 0) {
      console.log(`\nExecuting bulk update of ${bulkUpdates.length} records...`);
      const start = Date.now();
      const result = await collection.bulkWrite(bulkUpdates);
      console.log(`Bulk write completed in ${Date.now() - start}ms.`);
      console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    } else if (bulkUpdates.length > 0) {
      console.log(`\nDry run completed. ${bulkUpdates.length} update operations simulated. Run with '--commit' to apply these changes.`);
    } else {
      console.log('\nNo updates needed.');
    }

  } catch (err) {
    console.error('Error during execution:', err);
  } finally {
    await client.close();
  }
}

run();
