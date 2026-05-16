let refreshTimer = null;
let currentInterval = 5000; // Default awal 5 detik

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

// Fungsi simulasi klik fisik tingkat tinggi
function triggerClick(el) {
    if (!el) return;
    el.click();
    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
        const event = new MouseEvent(eventType, { view: window, bubbles: true, cancelable: true });
        el.dispatchEvent(event);
    });
}

function runAutoRefresh() {
    chrome.storage.local.get(['targetUrl', 'isActive', 'customInterval', 'refreshCount'], (result) => {
        if (!result.isActive) {
            if (refreshTimer) { clearInterval(refreshTimer); refreshTimer = null; }
            return;
        }

        const newInterval = (result.customInterval || 5) * 1000;

        if (newInterval !== currentInterval || !refreshTimer) {
            currentInterval = newInterval;
            if (refreshTimer) clearInterval(refreshTimer);
            
            refreshTimer = setInterval(() => {
                const currentUrl = window.location.href;
                if (result.targetUrl && currentUrl.includes(result.targetUrl)) {
                    
                    // 1. Logika mematikan checkbox secara agresif
                    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                    let checkboxDeactivated = false;

                    checkboxes.forEach(cb => {
                        // Cari kontainer pembungkus yang punya teks "Auto Refresh"
                        let parent = cb.parentElement;
                        let isAutoRefreshNode = false;
                        
                        // Cari ke atas hingga 3 level parent untuk memastikan teks "Auto Refresh" tertangkap
                        for (let i = 0; i < 3; i++) {
                            if (parent && parent.innerText && parent.innerText.includes('Auto Refresh')) {
                                isAutoRefreshNode = true;
                                break;
                            }
                            if (parent) parent = parent.parentElement;
                        }

                        if (isAutoRefreshNode) {
                            // Jika checkbox terdeteksi aktif di sistem DOM
                            if (cb.checked) {
                                console.log("Matiin centang via Input...");
                                triggerClick(cb);
                                checkboxDeactivated = true;
                            }
                            
                            // Framework ExtJS/KendoUI sering mengunci klik pada elemen induknya.
                            // Kita tembak juga parent-nya agar perubahan visual & state terjadi serentak.
                            if (cb.parentElement) {
                                console.log("Matiin centang via Parent Wrapper...");
                                triggerClick(cb.parentElement);
                                checkboxDeactivated = true;
                            }
                        }
                    });

                    // 2. Berikan jeda 400ms agar script web sempat memproses pembukaan lock tombol
                    setTimeout(() => {
                        const elements = document.querySelectorAll('a, button, span, div, td');
                        const refreshBtn = Array.from(elements).find(el => 
                            el.innerText && el.innerText.trim() === 'Refresh' && el.offsetParent !== null
                        );

                        if (refreshBtn) {
                            // Cek apakah tombol memiliki indikasi disabled dari class bawaan framework web
                            const isStyleDisabled = refreshBtn.className && (
                                refreshBtn.className.includes('disabled') || 
                                refreshBtn.className.includes('blur')
                            );

                            if (refreshBtn.disabled || isStyleDisabled) {
                                // JIKA MASIH TERKUNCI: Coba paksa klik sekali lagi pada parent checkbox sebagai jalan terakhir
                                showStatus("🔄 Membuka paksa lock web...", "#e67e22");
                                checkboxes.forEach(cb => {
                                    if (cb.parentNode && cb.parentNode.innerText && cb.parentNode.innerText.includes('Auto Refresh')) {
                                        triggerClick(cb.parentNode);
                                    }
                                });
                                return; 
                            }

                            // JIKA SUDAH TERBUKA: Jalankan refresh
                            showStatus(`🔄 Refreshing (Tiap ${result.customInterval}s)...`, "#2980b9");
                            triggerClick(refreshBtn);

                            const currentCount = result.refreshCount || 0;
                            chrome.storage.local.set({ refreshCount: currentCount + 1 });
                        } else {
                            showStatus("⚠️ Tombol Ga Ketemu", "#f39c12");
                        }
                    }, checkboxDeactivated ? 400 : 50); 

                }
            }, currentInterval);
        }
    });
}

chrome.storage.onChanged.addListener(() => {
    runAutoRefresh();
});

runAutoRefresh();