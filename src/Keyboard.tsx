import React, { useEffect, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';

function Keyboard({ octave, setOctave }) {
  const [pressedKeys, setPressedKeys] = useState({});

  const white_key_width = 80;
  const white_key_height = 350;
  const white_key_spacing = 20;
  const white_key_fill = "white";
  const white_key_stroke = "black";
  const white_key_stroke_width = 5;
  const white_key_start_x = 300;
  const white_key_start_y = 20;

  const black_key_width = 40;
  const black_key_height = 170;
  const black_key_fill = "black";
  const black_key_stroke = "black";
  const black_key_stroke_width = 5;
  const black_key_start_y = 20;
  const black_key_xs = [352, 450, 592, 680, 768];

  const white_letter_gap_from_key_bottom = 150;
  const black_letter_gap_from_key_bottom = 67;

  const keyToNoteMap = {
    'a': `C${octave}`, 
    's': `D${octave}`, 
    'd': `E${octave}`, 
    'f': `F${octave}`, 
    'g': `G${octave}`, 
    'h': `A${octave}`, 
    'j': `B${octave}`, 
    'k': `C${octave + 1}`,
    'w': `C#${octave}`, 
    'e': `D#${octave}`, 
    't': `F#${octave}`, 
    'y': `G#${octave}`, 
    'u': `A#${octave}`,
  };

  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase();
    if (keyToNoteMap[key]) {
      setPressedKeys((prev) => ({ ...prev, [key]: true }));
    }
  };

  const handleKeyUp = (event) => {
    const key = event.key.toLowerCase();
    if (keyToNoteMap[key]) {
      setPressedKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const changeOctave = (direction) => {
    setOctave((prevOctave) => {
      let newOctave = prevOctave + direction;
      if (newOctave < 1) return 1;
      if (newOctave > 7) return 7;
      return newOctave;
    });
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div>
      <button onClick={() => changeOctave(-1)}>-</button>
      <span>Octave {octave}</span>
      <button onClick={() => changeOctave(1)}>+</button>

      <Stage width={1500} height={400}>
        <Layer>
          {/* White keys */}
          {Array.from({ length: 8 }).map((_, index) => {
            const keyX = white_key_start_x + index * white_key_width;
            const keyLetter = Object.values(keyToNoteMap)[index];

            return (
              <React.Fragment key={`white-${index}`}>
                <Rect
                  x={keyX}
                  y={white_key_start_y}
                  width={white_key_width}
                  height={white_key_height}
                  fill={pressedKeys[Object.keys(keyToNoteMap)[index]] ? "lightgray" : white_key_fill}
                  stroke={white_key_stroke}
                  strokeWidth={white_key_stroke_width}
                />
                <Text
                  text={keyLetter}
                  x={keyX}
                  y={white_key_start_y + white_letter_gap_from_key_bottom}
                  width={white_key_width}
                  height={white_key_height}
                  align="center"
                  verticalAlign="middle"
                  fontSize={24}
                  fill="black"
                />
              </React.Fragment>
            );
          })}

          {/* Black keys */}
          {black_key_xs.map((x, index) => {
            const noteSharp = ["C#", "D#", "F#", "G#", "A#"][index];
            const keyLetter = ['w', 'e', 't', 'y', 'u'][index];

            return (
              <React.Fragment key={`black-${index}`}>
                <Rect
                  x={x}
                  y={black_key_start_y}
                  width={black_key_width}
                  height={black_key_height}
                  fill={pressedKeys[keyLetter] ? "#1e1e1e" : black_key_fill}
                  stroke={black_key_stroke}
                  strokeWidth={black_key_stroke_width}
                />
                <Text
                  text={noteSharp}
                  x={x}
                  y={black_key_start_y + black_letter_gap_from_key_bottom}
                  width={black_key_width}
                  height={black_key_height}
                  align="center"
                  verticalAlign="middle"
                  fontSize={20}
                  fill="white"
                />
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}

export default Keyboard;
