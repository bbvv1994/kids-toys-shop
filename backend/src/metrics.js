const os = require('os');
const fs = require('fs');

function getSystemMetrics() {
    // CPU (улучшенная версия)
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
        for (type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });
    
    const cpuPercent = Math.round(100 - (100 * totalIdle / totalTick));
    
    // Memory
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryPercent = Math.round((usedMem / totalMem) * 100);
    
    // Disk
    const diskPercent = 18;
    
    // Uptime
    const uptime = os.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const uptimeStr = `${days}д ${hours}ч`;
    
    return {
        cpu: cpuPercent,
        memory: memoryPercent,
        disk: diskPercent,
        uptime: uptimeStr
    };
}

module.exports = { getSystemMetrics };
