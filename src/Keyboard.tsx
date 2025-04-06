import { useEffect, useState } from 'react'
import { Stage, Layer, Rect, Text } from 'react-konva';

function Keyboard() {
    const white_key_width = 80
    const white_key_height = 350
    const white_key_spacing = 20
    const white_key_fill = "white"
    const white_key_stroke = "black"
    const white_key_stroke_width = 5
    const white_key_start_x = 300
    const white_key_start_y = 20

    const black_key_width = 40
    const black_key_height = 170
    const black_key_spacing = 20
    const black_key_fill = "black"
    const black_key_stroke = "black"
    const black_key_stroke_width = 5
    const black_key_start_y = 20
    const black_key_xs = [352, 450, 592, 680, 768]

    const white_letter_gap_from_key_bottom = 150
    const black_letter_gap_from_key_bottom = 67
  
    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
            <Rect x={white_key_start_x} y={white_key_start_y} width={white_key_width} height={white_key_height} fill={white_key_fill} stroke={white_key_stroke} strokeWidth={white_key_stroke_width} />
            <Text text="C" x={white_key_start_x} y={white_key_start_y + white_letter_gap_from_key_bottom} width={white_key_width} height={white_key_height} align="center" verticalAlign="middle" fontSize={24} fill="black" />
            <Rect x={white_key_start_x + (1 * white_key_width) + (0 * white_key_spacing)} y={white_key_start_y} width={white_key_width} height={white_key_height} fill={white_key_fill} stroke={white_key_stroke} strokeWidth={white_key_stroke_width} />
            <Text text="D" x={white_key_start_x + (1 * white_key_width)} y={white_key_start_y + white_letter_gap_from_key_bottom} width={white_key_width} height={white_key_height} align="center" verticalAlign="middle" fontSize={24} fill="black" />
            <Rect x={white_key_start_x + (2 * white_key_width) + (0 * white_key_spacing)} y={white_key_start_y} width={white_key_width} height={white_key_height} fill={white_key_fill} stroke={white_key_stroke} strokeWidth={white_key_stroke_width} />
            <Text text="E" x={white_key_start_x + (2 * white_key_width)} y={white_key_start_y + white_letter_gap_from_key_bottom} width={white_key_width} height={white_key_height} align="center" verticalAlign="middle" fontSize={24} fill="black" />
            <Rect x={white_key_start_x + (3 * white_key_width) + (0 * white_key_spacing)} y={white_key_start_y} width={white_key_width} height={white_key_height} fill={white_key_fill} stroke={white_key_stroke} strokeWidth={white_key_stroke_width} />
            <Text text="F" x={white_key_start_x + (3 * white_key_width)} y={white_key_start_y + white_letter_gap_from_key_bottom} width={white_key_width} height={white_key_height} align="center" verticalAlign="middle" fontSize={24} fill="black" />
            <Rect x={white_key_start_x + (4 * white_key_width) + (0 * white_key_spacing)} y={white_key_start_y} width={white_key_width} height={white_key_height} fill={white_key_fill} stroke={white_key_stroke} strokeWidth={white_key_stroke_width} />
            <Text text="G" x={white_key_start_x + (4 * white_key_width)} y={white_key_start_y + white_letter_gap_from_key_bottom} width={white_key_width} height={white_key_height} align="center" verticalAlign="middle" fontSize={24} fill="black" />
            <Rect x={white_key_start_x + (5 * white_key_width) + (0 * white_key_spacing)} y={white_key_start_y} width={white_key_width} height={white_key_height} fill={white_key_fill} stroke={white_key_stroke} strokeWidth={white_key_stroke_width} />
            <Text text="A" x={white_key_start_x + (5 * white_key_width)} y={white_key_start_y + white_letter_gap_from_key_bottom} width={white_key_width} height={white_key_height} align="center" verticalAlign="middle" fontSize={24} fill="black" />
            <Rect x={white_key_start_x + (6 * white_key_width) + (0 * white_key_spacing)} y={white_key_start_y} width={white_key_width} height={white_key_height} fill={white_key_fill} stroke={white_key_stroke} strokeWidth={white_key_stroke_width} />
            <Text text="B" x={white_key_start_x + (6 * white_key_width)} y={white_key_start_y + white_letter_gap_from_key_bottom} width={white_key_width} height={white_key_height} align="center" verticalAlign="middle" fontSize={24} fill="black" />
            <Rect x={white_key_start_x + (7 * white_key_width) + (0 * white_key_spacing)} y={white_key_start_y} width={white_key_width} height={white_key_height} fill={white_key_fill} stroke={white_key_stroke} strokeWidth={white_key_stroke_width} />
            <Text text="C" x={white_key_start_x + (7 * white_key_width)} y={white_key_start_y + white_letter_gap_from_key_bottom} width={white_key_width} height={white_key_height} align="center" verticalAlign="middle" fontSize={24} fill="black" />
        </Layer>
        <Layer>
            <Rect x={black_key_xs[0]} y={black_key_start_y} width={black_key_width} height={black_key_height} fill={black_key_fill} stroke={black_key_stroke} strokeWidth={black_key_stroke_width} />
            <Text text="C#" x={black_key_xs[0]} y={black_key_start_y + black_letter_gap_from_key_bottom} width={black_key_width} height={black_key_height} align="center" verticalAlign="middle" fontSize={20} fill="white" />
            <Rect x={black_key_xs[1]} y={black_key_start_y} width={black_key_width} height={black_key_height} fill={black_key_fill} stroke={black_key_stroke} strokeWidth={black_key_stroke_width} />
            <Text text="D#" x={black_key_xs[1]} y={black_key_start_y + black_letter_gap_from_key_bottom} width={black_key_width} height={black_key_height} align="center" verticalAlign="middle" fontSize={20} fill="white" />
            <Rect x={black_key_xs[2]} y={black_key_start_y} width={black_key_width} height={black_key_height} fill={black_key_fill} stroke={black_key_stroke} strokeWidth={black_key_stroke_width} />
            <Text text="F#" x={black_key_xs[2]} y={black_key_start_y + black_letter_gap_from_key_bottom} width={black_key_width} height={black_key_height} align="center" verticalAlign="middle" fontSize={20} fill="white" />
            <Rect x={black_key_xs[3]} y={black_key_start_y} width={black_key_width} height={black_key_height} fill={black_key_fill} stroke={black_key_stroke} strokeWidth={black_key_stroke_width} />
            <Text text="G#" x={black_key_xs[3]} y={black_key_start_y + black_letter_gap_from_key_bottom} width={black_key_width} height={black_key_height} align="center" verticalAlign="middle" fontSize={20} fill="white" />
            <Rect x={black_key_xs[4]} y={black_key_start_y} width={black_key_width} height={black_key_height} fill={black_key_fill} stroke={black_key_stroke} strokeWidth={black_key_stroke_width} />
            <Text text="A#" x={black_key_xs[4]} y={black_key_start_y + black_letter_gap_from_key_bottom} width={black_key_width} height={black_key_height} align="center" verticalAlign="middle" fontSize={20} fill="white" />
        </Layer>
      </Stage>
    );
}

export default Keyboard