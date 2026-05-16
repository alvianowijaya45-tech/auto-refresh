const toggleBtn = document.getElementById('toggleBtn');
const webUrlInput = document.getElementById('webUrl');
const intervalInput = document.getElementById('intervalTime');
const statusLabel = document.getElementById('statusLabel');
const statusDot = document.getElementById('statusDot');
const refreshCountLabel = document.getElementById('refreshCount');
const currentIntervalLabel = document.getElementById('currentIntervalLabel');

// Fungsi update angka counter secara berkala saat popup dibuka
function updatePopupStats() {
  chrome.storage.local.get(['targetUrl', 'isActive', 'customInterval', 'refreshCount'], (result) => {
    if (result.targetUrl && !webUrlInput.value) webUrlInput.value = result.targetUrl;
    if (result.customInterval && !intervalInput.value) intervalInput.value = result.customInterval;
    
    // Tampilkan jumlah berapa kali tombol sudah di-klik
    refreshCountLabel.textContent = result.refreshCount || 0;
    
    if (result.isActive) {
      setUIActive(result.customInterval || 5);
    } else {
      setUIInactive();
    }
  });
}

toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get(['isActive'], (result) => {
    const currentState = result.isActive || false;
    const nextState = !currentState;
    const urlValue = webUrlInput.value.trim();
    const intervalValue = parseInt(intervalInput.value) || 5;

    if (!urlValue && nextState) {
      alert('Masukkan URL terlebih dahulu!');
      return;
    }

    // Jika baru mulai (START), reset count dari 0 atau biarkan berlanjut
    const updates = { 
      targetUrl: urlValue, 
      isActive: nextState,
      customInterval: intervalValue 
    };
    
    if (nextState) updates.refreshCount = 0; // Reset counter tiap pencet START baru

    chrome.storage.local.set(updates, () => {
      if (nextState) {
        setUIActive(intervalValue);
      } else {
        setUIInactive();
      }
    });
  });
});

function setUIActive(sec) {
  toggleBtn.textContent = "STOP";
  toggleBtn.className = "btn-stop";
  statusLabel.textContent = "Status: Berjalan";
  statusLabel.className = "text-active";
  statusDot.className = "dot active";
  currentIntervalLabel.textContent = `${sec}s`;
}

function setUIInactive() {
  toggleBtn.textContent = "START";
  toggleBtn.className = "btn-start";
  statusLabel.textContent = "Status: Berhenti";
  statusLabel.className = "text-inactive";
  statusDot.className = "dot";
  currentIntervalLabel.textContent = "-";
}

// Jalankan dan sinkronkan data secara real-time
updatePopupStats();
setInterval(updatePopupStats, 1000); // Sinkronisasi counter tiap 1 detik saat popup dibuka