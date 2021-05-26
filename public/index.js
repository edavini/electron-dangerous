const  electron = require('electron');

function ge(id) {
    return document.getElementById(id);
}
function sc(id, text) {
    ge(id).textContent = text;
}

function handleFlags(flags) {
    flags.map((flag, index) => { toggleFlag(index, flag.value === '1', flag.blink) });
}

function toggleFlag(flag, value, blink) {
    const classToAdd = value ? "on" : "off";
    const classToRemove = value ? "off" : "on";
    const flagElement = ge('flag-' + flag);
    flagElement.classList.add(classToAdd);
    flagElement.classList.remove(classToRemove);
    if (blink && value) {
        flagElement.classList.add('blink')
    } else {
        flagElement.classList.remove('blink')
    }
}

electron.ipcRenderer.on('ping', (event, message) => {
    console.log(new Date() + ' - ' + 'Data Received')

    const data = JSON.parse(message)
    handleFlags(data.flags);
    // const filteredFlags = data.flags.filter(x => x.value == 1).map(x => x.name);

    sc('flags-binary', Number(data.Flags).toString(2));
    sc('timestamp', data.timestamp);
    // sc('flags', JSON.stringify(filteredFlags, null, 2));
    sc('pips', data.Pips);
    sc('fuel', JSON.stringify(data.Fuel));
    sc('cargo', JSON.stringify(data.Cargo));
    sc('counter', Number(document.getElementById('counter').textContent) +1);
})
