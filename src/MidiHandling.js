import {WebMidi} from "webmidi";

// Enable WEBMIDI.js and trigger the onEnabled() function when ready
export default function startUp(game) {
    activeGame = game
    WebMidi.enable()
        .then(onEnabled)
        .catch((err) => alert(err));
}


// Function triggered when WEBMIDI.js is ready
function onEnabled() {
  if (WebMidi.inputs.length < 1) {
    console.log("No device detected.");
  } else {
    WebMidi.inputs.forEach((device, index) => {
     console.log(`${index}: ${device.name}`);
    });
  }

  const mySynth = WebMidi.inputs[0];
  // const mySynth = WebMidi.getInputByName("TYPE NAME HERE!")

  mySynth.channels[1].addListener("noteon", (e) => {
    activeGame.keysPressed.push(e.note)
   //console.log(e.note.name);
  });
}
