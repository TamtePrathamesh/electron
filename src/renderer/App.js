import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
const { ipcRenderer } = window.require('electron');


import {useEffect, useState} from "react";

const os = window.require('os')
const fs = window.require('fs')


function bytesToGB(bytes) {
  return (bytes / (1024 ** 3)).toFixed(2);
}

// async function getInstalledApplications() {
//   if (os.platform() === 'win32') {
//     // Windows
//     const { exec } = require('child_process');
//     const installedApps = await new Promise((resolve, reject) => {
//       exec('wmic product get Name', (error, stdout) => {
//         if (error) {
//           reject(error);
//           return;
//         }
//         const apps = stdout.trim().split('\r\r\n').slice(1);
//         resolve(apps);
//       });
//     });
//     return installedApps;
//   } else if (os.platform() === 'darwin') {
//     // macOS
//     const {execSync} = require('child_process');
//     const installedApps = execSync('ls /Applications').toString().trim().split('\n');
//     return installedApps;
//   } else if (os.platform() === 'linux') {
//     // Linux (You might need to adapt this depending on the package manager)
//     const { execSync } = require('child_process');
//     const installedApps = execSync('dpkg -l | grep ii | awk \'{ print $2 }\'').toString().trim().split('\n');
//     return installedApps;
//   }
//   return [];
// }


 function Hello() {

  const [installedApps, setInstalledApps] = useState([]);
   const [diskInfo, setDiskInfo] = useState([]);
   const [isAntivirusInstalled, setAntivirus] = useState(true);
   const [isInstalled, setIsInstalled] = useState(false);
   const [isActiveFirewall, setActiveFirewall] = useState(true);


   useEffect(() => {
     async function fetchInstalledApps() {
       try {
         const apps = await ipcRenderer.invoke('getInstalledApps');
         // const apps = await getInstalledApplications()
         setInstalledApps(apps);
       } catch (error) {
         console.error('Error fetching installed apps:', error);
       }
     }
     fetchInstalledApps();


     async function fetchDiskInfo() {
       try {
         const info = await ipcRenderer.invoke('getDiskInfo');
         setDiskInfo(info);
       } catch (error) {
         console.error('Error fetching disk info:', error);
       }
     }
     fetchDiskInfo();

     async function getAntivirusStatus() {
       try {
         const info = await ipcRenderer.invoke('getAntivirusStatus');
        // console.log("antivirus status", info)
         setAntivirus(info);
       } catch (error) {
         console.error('Error fetching disk info:', error);
       }
     }
     getAntivirusStatus();



     async function checkAntiSpyware() {
       try {
         const result = await ipcRenderer.invoke('isAntiSpywareInstalled');
         setIsInstalled(result);
       } catch (error) {
         console.error('Error checking anti-spyware:', error);
       }
     }
     checkAntiSpyware();



     async function checkActiveFirewall() {
       try {
         const result = await ipcRenderer.invoke('isActiveFirewallInstalled');
         setActiveFirewall(result);
       } catch (error) {
         console.error('Error checking active firewall:', error);
       }
     }
     checkActiveFirewall();
   }, []);

  //console.log("hey there");


  const totalMemoryBytes = os.totalmem();
  const freeMemoryBytes = os.freemem();
  const cpuInfo = os.cpus()[0].model;
  const osInfo = `${os.type()} ${os.release()}`;
  // const diskInfo = fs.statSync('/').size;
  const diskFreeInfo = fs.statSync('/').available;

  const totalMemoryGB = bytesToGB(totalMemoryBytes);
  const freeMemoryGB = bytesToGB(freeMemoryBytes);
  const diskSizeGB = bytesToGB(diskInfo);
  const diskFreeGB = bytesToGB(diskFreeInfo);
  // const diskSizeGB = bytesToGB(diskInfo.size);
  // const diskFreeGB = bytesToGB(diskInfo.available);



//console.log("use state anti", isAntivirusInstalled);
  return (
    <div>

      {/*<h2>{cpuInfo}</h2>*/}
      {/*<h1>System Information</h1>*/}
      {/*<p>Operating System: {osInfo}</p>*/}
      {/*<p>CPU: {cpuInfo}</p>*/}
      {/*<p>Total System Memory: {totalMemoryGB} GB</p>*/}
      {/*<p>Free Memory: {freeMemoryGB} GB</p>*/}



      {/*<h1>Hard Disk Information</h1>*/}
      {/*<table>*/}
      {/*  <thead>*/}
      {/*  <tr>*/}
      {/*    <th>Drive</th>*/}
      {/*    <th>Free Space</th>*/}
      {/*    <th>Total Capacity</th>*/}
      {/*  </tr>*/}
      {/*  </thead>*/}
      {/*  <tbody>*/}
      {/*  {diskInfo.map((info, index) => {*/}
      {/*    const [drive, freeSpace, totalCapacity] = info.split(/\s+/);*/}
      {/*    return (*/}
      {/*      <tr key={index}>*/}
      {/*        <td>{drive}</td>*/}
      {/*        <td>{freeSpace}</td>*/}
      {/*        <td>{totalCapacity}</td>*/}
      {/*      </tr>*/}
      {/*    );*/}
      {/*  })}*/}
      {/*  </tbody>*/}
      {/*</table>*/}

      {/*<h1>Installed Applications</h1>*/}
      {/*<ul>*/}
      {/*    {installedApps.map((app, index) => (*/}
      {/*        <li key={index}>{app}</li>*/}
      {/*    ))}*/}
      {/*</ul>*/}



      {/*{isAntivirusInstalled ? (*/}
      {/*  <h2>AV Status: ## Antivirus software is installed.</h2>*/}
      {/*) : (*/}
      {/*  <h2>AV Status: ## No antivirus software detected.</h2>*/}
      {/*)}*/}


      {/*<h2>Anti-Spyware Check : </h2>*/}
      {/*{isInstalled ? (*/}
      {/*  <p>Anti-spyware software is installed.</p>*/}
      {/*) : (*/}
      {/*  <p>No anti-spyware software detected.</p>*/}
      {/*)}*/}



      {/*<h2>Active Firewall Check : </h2>*/}
      {/*{isActiveFirewall ? (*/}
      {/*  <p>An active firewall is installed.</p>*/}
      {/*) : (*/}
      {/*  <p>No active firewall detected.</p>*/}
      {/*)}*/}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
