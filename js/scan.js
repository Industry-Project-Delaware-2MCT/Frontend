const scan = async () => {
  try {
    const ndef = new NDEFReader();
    await ndef.scan();
    console.log("Scanning");

    ndef.addEventListener("readingerror", () => {
      console.log("Argh! Cannot read data from the NFC tag. Try another one?");
      errorMessage.innerHTML = "Scan niet gelukt, probeer opnieuw of log manueel in";
    });

    ndef.addEventListener("reading", ({ message, serialNumber }) => {
      console.log(`Serial Number: ${serialNumber}`);
      console.log(`Records: (${message.records.length})`);
      console.log(`Records: (${message.records})`);
    });
  } catch (error) {
    console.log("Argh! " + error);
    errorMessage.innerHTML = "Er is iets fout gegaan, probeer opnieuw of log manueel in";
  }
};

document.addEventListener('DOMContentLoaded', async () => { 
  errorMessage = document.querySelector(".js-error");
  scan();
})