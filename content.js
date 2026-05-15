const intervalTime = 5000; 

function showStatus(message, color) {
    let statusDiv = document.getElementById('extension-status-popup');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'extension-status-popup';
        statusDiv.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 10000;
            padding: 12px 24px; border-radius: 10px; color: white;
            font-family: sans-serif; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: all 0.5s ease;
        `;
        document.body.appendChild(statusDiv);
    }
    statusDiv.textContent = message;
    statusDiv.style.backgroundColor = color;
    statusDiv.style.opacity = '1';
    setTimeout(() => { statusDiv.style.opacity = '0'; }, 2000);
}

function triggerClick(el) {
    // Teknik 1: Klik Standar
    el.click();
    
    // Teknik 2: Simulasi Mouse Down & Up (Untuk tombol yang pake library JS khusus)
    ['mousedown', 'mouseup', 'click'].forEach(eventType => {
        const event = new MouseEvent(eventType, {
            view: window,
            bubbles: true,
            cancelable: true
        });
        el.dispatchEvent(event);
    });
}

function autoClick() {
    chrome.storage.local.get(['targetUrl'], (result) => {
        const currentUrl = window.location.href;
        if (result.targetUrl && currentUrl.includes(result.targetUrl)) {
            
            // Cari semua elemen yang mengandung kata "Refresh"
            const elements = document.querySelectorAll('a, button, span, div, td');
            const refreshBtn = Array.from(elements).find(el => 
                el.innerText && el.innerText.trim() === 'Refresh' && el.offsetParent !== null
            );

            if (refreshBtn) {
                showStatus("🔄 Memaksa Refresh...", "#2980b9");
                triggerClick(refreshBtn);
            } else {
                showStatus("⚠️ Tombol Ga Ketemu", "#f39c12");
            }
        }
    });
}

setInterval(autoClick, intervalTime);