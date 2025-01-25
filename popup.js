document.getElementById("save").addEventListener("click", () => {
  const rate = document.getElementById("default-rate").value;
  chrome.storage.sync.set({ defaultRate: rate }, () => {
    alert("Default rate saved!");
  });
});
