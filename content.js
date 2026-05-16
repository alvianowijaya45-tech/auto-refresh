let refreshTimer = null;
let currentInterval = 1000; // Default awal 10 detik

function showStatus(message, color) {
    let statusDiv = document.getElementById('extension-status-popup');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'extension-status-popup';
        statusDiv.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 10000;
            padding: 12px 24px; border-radius: 10px; color: white;
            font-family: sans-serif; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.5s ease; pointer-events: none;
        `;
        document.body.appendChild(statusDiv);
    }
    statusDiv.textContent = message;
    statusDiv.style.backgroundColor = color;
    statusDiv.style.opacity = '1';
    setTimeout(() => { statusDiv.style.opacity = '0'; }, 2000);
}

function triggerClick(el) {
    el.click();
    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
        const event = new MouseEvent(eventType, { view: window, bubbles: true, cancelable: true });
        el.dispatchEvent(event);
    });
}

function runAutoRefresh() {
    // Menambahkan 'refreshCount' agar bisa diambil dan diperbarui nilainya
    chrome.storage.local.get(['targetUrl', 'isActive', 'customInterval', 'refreshCount'], (result) => {
        // Stop timer jika status tidak aktif
        if (!result.isActive) {
            if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
            return;
        }

        // Hitung interval baru dari storage (dalam milidetik)
        const newInterval = (result.customInterval || 5) * 1000;

        // Jika waktu interval berubah dari sebelumnya, buat ulang timer-nya
        if (newInterval !== currentInterval || !refreshTimer) {
            currentInterval = newInterval;
            if (refreshTimer) clearInterval(refreshTimer);
            
            refreshTimer = setInterval(() => {
                const currentUrl = window.location.href;
                if (result.targetUrl && currentUrl.includes(result.targetUrl)) {
                    const elements = document.querySelectorAll('a, button, span, div, td');
                    const refreshBtn = Array.from(elements).find(el => 
                        el.innerText && el.innerText.trim() === 'Refresh' && el.offsetParent !== null
                    );

                    if (refreshBtn) {
                        showStatus(`🔄 Refreshing (Tiap ${result.customInterval}s)...`, "#2980b9");
                        triggerClick(refreshBtn);

                        // LOGIKA BARU: Ambil nilai counter saat ini, tambah 1, lalu simpan kembali
                        const currentCount = result.refreshCount || 0;
                        chrome.storage.local.set({ refreshCount: currentCount + 1 });
                    } else {
                        showStatus("⚠️ Tombol Ga Ketemu", "#f39c12");
                    }
                }
            }, currentInterval);
        }
    });
}

// Cek perubahan status atau interval secara real-time dari storage browser
chrome.storage.onChanged.addListener(() => {
    runAutoRefresh();
});

// Jalankan pengecekan otomatis saat halaman pertama kali dimuat
runAutoRefresh();