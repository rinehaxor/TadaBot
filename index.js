const axios = require('axios');
const readline = require('readline');

// Fungsi sleep untuk menambahkan delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Membuat interface readline untuk input dari user
const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout,
});

// Fungsi untuk mengambil daftar misi
async function getMissions(accessToken) {
   const url = 'https://backend.clutchwalletserver.xyz/activity/v2/missions?missionGroupId=eea00000-0000-4000-0000-000000000000&excludeAutoClaimable=true';
   const headers = {
      Authorization: `Bearer ${accessToken}`,
      'x-auth-client-id': 'TadaTonMiniApp',
      'x-auth-client-version': '1',
   };

   try {
      const response = await axios.get(url, { headers });
      return response.data; // Mengembalikan daftar misi
   } catch (error) {
      console.error('Error fetching missions:', error);
   }
}

// Fungsi untuk menyelesaikan misi berdasarkan activityType
async function completeMission(accessToken, activityType) {
   const url = `https://backend.clutchwalletserver.xyz/activity/v2/activities/${activityType}`;
   const headers = {
      Authorization: `Bearer ${accessToken}`,
      'x-auth-client-id': 'TadaTonMiniApp',
      'x-auth-client-version': '1',
   };

   try {
      const response = await axios.post(url, {}, { headers });
      console.log(`Mission activity ${activityType} completed:`, response.data);
   } catch (error) {
      console.error(`Error completing mission ${activityType}:`, error);
   }
}

// Fungsi untuk klaim misi berdasarkan ID misi
async function claimMission(accessToken, missionId) {
   const url = `https://backend.clutchwalletserver.xyz/activity/v2/missions/${missionId}/claim`;
   const headers = {
      Authorization: `Bearer ${accessToken}`,
      'x-auth-client-id': 'TadaTonMiniApp',
      'x-auth-client-version': '1',
   };

   try {
      const response = await axios.post(url, {}, { headers });
      console.log(`Mission ${missionId} claim status:`, response.data);
   } catch (error) {
      console.error(`Error claiming mission ${missionId}:`, error);
   }
}

// Main function to handle login, complete missions, and claim them
async function main() {
   rl.question('Masukkan access token Anda: ', async (accessToken) => {
      // Step 2: Ambil daftar misi
      const missions = await getMissions(accessToken);

      if (!missions || missions.length === 0) {
         console.log('Tidak ada misi yang ditemukan.');
         rl.close();
         return;
      }

      console.log(`Total misi ditemukan: ${missions.length}`);

      // Step 3: Selesaikan misi yang memiliki activityType
      for (let mission of missions) {
         if (mission.activityTypes && mission.activityTypes.length > 0) {
            const activityType = mission.activityTypes[0]; // Ambil activityType pertama
            console.log(`Menyelesaikan misi dengan activityType: ${activityType}`);
            await completeMission(accessToken, activityType);
            await sleep(1000); // Delay 1 detik setelah menyelesaikan misi
         }
      }

      // Step 4: Klaim misi yang bisa di-claim setelah diselesaikan
      const claimableMissions = missions.filter((mission) => mission.claimable);

      if (claimableMissions.length === 0) {
         console.log('Tidak ada misi yang bisa di-claim.');
         rl.close();
         return;
      }

      console.log(`Total misi yang bisa di-claim: ${claimableMissions.length}`);

      // Step 5: Klaim setiap misi yang bisa di-claim
      for (let mission of claimableMissions) {
         const missionId = mission.id; // Ambil ID misi untuk klaim
         console.log(`Mengklaim misi dengan ID: ${missionId}`);
         await claimMission(accessToken, missionId);
         await sleep(1000); // Delay 1 detik setelah klaim misi
      }

      rl.close(); // Menutup readline setelah proses selesai
   });
}

main();
