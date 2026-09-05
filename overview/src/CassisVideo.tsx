import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/SpaceMono";

const { fontFamily: FONT } = loadGrotesk("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});
const { fontFamily: MONO } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

type Pt = { x: number; y: number };

type Inst = {
  id: string;
  person: string;
  color: string;
  route: Pt;
  final: Pt;
};

type BoxSpec = {
  id: string;
  name: string;
  tag: string | null;
  color: string;
};

type ArrowSpec = { a: Pt; b: Pt; from: number; to: number };

type GlowSpec = {
  inst: string;
  color: string;
  from: number;
  to: number | null;
};

type BalSpec = { base: number; from: number; to: number; delta: number };

type BubbleSpec = { id: string; text: string; from: number; to: number };

const C = {
  bg: "#0b0e14",
  green: "#22c55e",
  blue: "#3b82f6",
  orange: "#f97316",
  purple: "#a855f7",
  red: "#ef4444",
  gray: "#9ca3af",
  yellow: "#eab308",
  text: "#e6edf3",
  muted: "#8b98a9",
};

const R = 52;

const ERNEST_INTRO: Pt = { x: 900, y: 540 };

const BOX_CENTERS = [300, 740, 1180, 1620];
const BOX_TOP = 160;
const BOX_W = 380;
const BOX_H = 720;
const TOP_NODE_Y = 360;
const HTLC_Y = 540;
const BOTTOM_NODE_Y = 720;
const HTLC_H = 90;
const HTLC_W = 130;

const INSTANCES: Inst[] = [
  {
    id: "alice",
    person: "Alice",
    color: C.red,
    route: { x: 400, y: 560 },
    final: { x: BOX_CENTERS[0], y: TOP_NODE_Y },
  },
  {
    id: "bob1",
    person: "Bob",
    color: C.gray,
    route: { x: 620, y: 180 },
    final: { x: BOX_CENTERS[0], y: BOTTOM_NODE_Y },
  },
  {
    id: "bob2",
    person: "Bob",
    color: C.gray,
    route: { x: 800, y: 340 },
    final: { x: BOX_CENTERS[1], y: TOP_NODE_Y },
  },
  {
    id: "carol1",
    person: "Carol",
    color: C.gray,
    route: { x: 1280, y: 240 },
    final: { x: BOX_CENTERS[1], y: BOTTOM_NODE_Y },
  },
  {
    id: "carol2",
    person: "Carol",
    color: C.gray,
    route: { x: 1160, y: 640 },
    final: { x: BOX_CENTERS[2], y: TOP_NODE_Y },
  },
  {
    id: "david1",
    person: "David",
    color: C.gray,
    route: { x: 1560, y: 800 },
    final: { x: BOX_CENTERS[2], y: BOTTOM_NODE_Y },
  },
  {
    id: "david2",
    person: "David",
    color: C.gray,
    route: { x: 1440, y: 360 },
    final: { x: BOX_CENTERS[3], y: TOP_NODE_Y },
  },
  {
    id: "ernest",
    person: "Ernest",
    color: C.yellow,
    route: { x: 1680, y: 540 },
    final: { x: BOX_CENTERS[3], y: BOTTOM_NODE_Y },
  },
];

const EXTRAS: Inst[] = [
  {
    id: "frank",
    person: "Frank",
    color: C.gray,
    route: { x: 760, y: 300 },
    final: { x: 760, y: 300 },
  },
  {
    id: "charlie",
    person: "Charlie",
    color: C.gray,
    route: { x: 980, y: 840 },
    final: { x: 980, y: 840 },
  },
  {
    id: "derek",
    person: "Derek",
    color: C.gray,
    route: { x: 1400, y: 320 },
    final: { x: 1400, y: 320 },
  },
  {
    id: "benjamin",
    person: "Benjamin",
    color: C.gray,
    route: { x: 1120, y: 600 },
    final: { x: 1120, y: 600 },
  },
];

const ALL = [...INSTANCES, ...EXTRAS];

const SPLIT_IDS = new Set(["bob2", "carol2", "david2"]);
const EXTRA_IDS = new Set(EXTRAS.map((e) => e.id));

const inst = (id: string): Inst => ALL.find((i) => i.id === id)!;

const BOXES: BoxSpec[] = [
  { id: "rootstock", name: "Rootstock", tag: null, color: C.green },
  { id: "cashu", name: "Minibits Mint", tag: "Cashu", color: C.blue },
  {
    id: "fedimint",
    name: "Orange Club Africa",
    tag: "Fedimint",
    color: C.orange,
  },
  { id: "arkade", name: "Arkade", tag: null, color: C.purple },
];

const T = {
  intro: 15,
  ernestMoveFrom: 90,
  ernestMoveTo: 120,
  scatterFrom: 100,
  scatterTo: 130,
  pathFrom: 150,
  extraOutFrom: 260,
  extraOutTo: 290,
  prepareFrom: 300,
  okFrom: 340,
  okTo: 385,
  boxFrom: 390,
  boxTo: 420,
  hopStart: 445,
  cycle: 45,
  commit: 615,
  settleFrom: 630,
  settleTo: 650,
  recvFrom: 665,
  recvTo: 680,
};

const HOP_IDS = ["alice", "bob2", "carol2", "david2"];

const hopArrowFrom = (i: number) => T.hopStart + T.cycle * i;
const hopReceiverGlowFrom = (i: number) => hopArrowFrom(i) + 20;

const GLOWS: GlowSpec[] = [
  {
    inst: "bob1",
    color: C.green,
    from: hopReceiverGlowFrom(0),
    to: hopArrowFrom(1),
  },
  {
    inst: "bob2",
    color: C.blue,
    from: hopReceiverGlowFrom(0),
    to: hopArrowFrom(1),
  },
  {
    inst: "carol1",
    color: C.blue,
    from: hopReceiverGlowFrom(1),
    to: hopArrowFrom(2),
  },
  {
    inst: "carol2",
    color: C.orange,
    from: hopReceiverGlowFrom(1),
    to: hopArrowFrom(2),
  },
  {
    inst: "david1",
    color: C.orange,
    from: hopReceiverGlowFrom(2),
    to: hopArrowFrom(3),
  },
  {
    inst: "david2",
    color: C.purple,
    from: hopReceiverGlowFrom(2),
    to: hopArrowFrom(3),
  },
  {
    inst: "ernest",
    color: C.yellow,
    from: hopReceiverGlowFrom(3),
    to: T.recvTo,
  },
];

const BALANCES: Record<string, BalSpec> = {
  alice: {
    base: 100,
    from: hopArrowFrom(0),
    to: hopArrowFrom(0) + 15,
    delta: -20,
  },
  bob2: {
    base: 100,
    from: hopArrowFrom(1),
    to: hopArrowFrom(1) + 15,
    delta: -20,
  },
  carol2: {
    base: 100,
    from: hopArrowFrom(2),
    to: hopArrowFrom(2) + 15,
    delta: -20,
  },
  david2: {
    base: 100,
    from: hopArrowFrom(3),
    to: hopArrowFrom(3) + 15,
    delta: -20,
  },
  bob1: { base: 100, from: T.recvFrom, to: T.recvTo, delta: 20 },
  carol1: { base: 100, from: T.recvFrom, to: T.recvTo, delta: 20 },
  david1: { base: 100, from: T.recvFrom, to: T.recvTo, delta: 20 },
  ernest: { base: 100, from: T.recvFrom, to: T.recvTo, delta: 20 },
};

const BUBBLES: BubbleSpec[] = [
  { id: "ernest", text: "pay me 20", from: 20, to: 85 },
  { id: "alice", text: "finding route", from: 100, to: 150 },
  { id: "alice", text: "PREPARE", from: T.prepareFrom, to: 340 },
  { id: "bob1", text: "OK", from: T.okFrom, to: T.okTo },
  { id: "carol1", text: "OK", from: T.okFrom, to: T.okTo },
  { id: "david1", text: "OK", from: T.okFrom, to: T.okTo },
  { id: "ernest", text: "OK", from: T.okFrom, to: T.okTo },
  { id: "ernest", text: "commit", from: T.commit, to: T.commit + 50 },
];

const clamp = (v: number) =>
  interpolate(v, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const fade = (frame: number, start: number, dur: number) =>
  clamp(
    interpolate(frame, [start, start + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );

const lerp = (a: Pt, b: Pt, p: number): Pt => ({
  x: a.x + (b.x - a.x) * p,
  y: a.y + (b.y - a.y) * p,
});

const pos = (id: string, frame: number): Pt => {
  const i = inst(id);
  if (EXTRA_IDS.has(id)) return i.route;
  if (SPLIT_IDS.has(id)) return i.final;

  if (id === "ernest") {
    const p = clamp(
      interpolate(frame, [T.ernestMoveFrom, T.ernestMoveTo], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
    if (frame < T.boxFrom) return lerp(ERNEST_INTRO, i.route, p);
    const q = clamp(
      interpolate(frame, [T.boxFrom, T.boxTo], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
    return lerp(i.route, i.final, q);
  }

  if (frame < T.boxFrom) return i.route;
  const q = clamp(
    interpolate(frame, [T.boxFrom, T.boxTo], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return lerp(i.route, i.final, q);
};

const opacity = (id: string, frame: number): number => {
  if (id === "alice" || id === "ernest") return fade(frame, 0, T.intro);
  if (EXTRA_IDS.has(id)) {
    return (
      fade(frame, T.scatterFrom, T.scatterTo - T.scatterFrom) *
      (1 - fade(frame, T.extraOutFrom, T.extraOutTo - T.extraOutFrom))
    );
  }
  if (SPLIT_IDS.has(id)) return fade(frame, T.boxFrom, T.boxTo - T.boxFrom);
  return fade(frame, T.scatterFrom, T.scatterTo - T.scatterFrom);
};

const balanceAt = (id: string, frame: number): number => {
  const b = BALANCES[id];
  if (!b) return 100;
  return Math.round(
    interpolate(frame, [b.from, b.to], [b.base, b.base + b.delta], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
};

const glowFor = (
  id: string,
  frame: number,
): { color: string; glowIn: number } | null => {
  const g = GLOWS.find((x) => x.inst === id && frame >= x.from);
  if (!g) return null;
  const glowIn = fade(frame, g.from, 10);
  if (g.to === null) return { color: g.color, glowIn };
  const glowOut = 1 - fade(frame, g.to, 10);
  return { color: g.color, glowIn: glowIn * glowOut };
};

const seg = (a: Pt, b: Pt) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  return { dx, dy, len, ux: dx / len, uy: dy / len };
};

const Box: React.FC<{
  box: BoxSpec;
  index: number;
  opacity: number;
  frame: number;
}> = ({ box, index, opacity, frame }) => {
  const cx = BOX_CENTERS[index];
  const left = cx - BOX_W / 2;
  const topY = BOX_TOP;
  const reached = frame >= hopReceiverGlowFrom(index);
  const commitGlow = fade(frame, T.commit, 20);
  const htlcAppear = fade(frame, hopArrowFrom(index) + 12, 8);

  return (
    <g opacity={opacity} style={{ pointerEvents: "none" }}>
      <rect
        x={left}
        y={topY}
        width={BOX_W}
        height={BOX_H}
        rx={30}
        fill={`${box.color}0d`}
        stroke={box.color}
        strokeWidth={3}
        strokeOpacity={0.9}
      />
      <text
        x={cx}
        y={topY + 60}
        textAnchor="middle"
        fontSize={26}
        fontWeight={700}
        fill={box.color}
        fontFamily={FONT}
      >
        {box.name.toUpperCase()}
      </text>
      {box.tag && (
        <text
          x={cx}
          y={topY + 92}
          textAnchor="middle"
          fontSize={14}
          fill={C.muted}
          fontFamily={MONO}
          letterSpacing={2}
        >
          {box.tag!.toUpperCase()}
        </text>
      )}

      <g opacity={htlcAppear}>
        <rect
          x={cx - HTLC_W / 2}
          y={HTLC_Y - HTLC_H / 2}
          width={HTLC_W}
          height={HTLC_H}
          rx={16}
          fill={reached ? `${box.color}22` : "#10141f"}
          stroke={reached ? box.color : C.muted}
          strokeWidth={2.5}
          style={{
            filter:
              commitGlow > 0
                ? `drop-shadow(0 0 ${30 * commitGlow}px ${box.color})`
                : "none",
          }}
        />
        <text
          x={cx}
          y={HTLC_Y - 2}
          textAnchor="middle"
          fontSize={17}
          fontWeight={700}
          fill={reached ? box.color : C.muted}
          fontFamily={MONO}
          letterSpacing={2}
        >
          HTLC
        </text>
        <text
          x={cx}
          y={HTLC_Y + 24}
          textAnchor="middle"
          fontSize={20}
          fontWeight={700}
          fill={C.text}
          fontFamily={MONO}
        >
          20
        </text>
      </g>
    </g>
  );
};

const Arrow: React.FC<{ arrow: ArrowSpec; frame: number }> = ({
  arrow,
  frame,
}) => {
  const s = seg(arrow.a, arrow.b);
  const x1 = arrow.a.x;
  const y1 = arrow.a.y;
  const x2 = arrow.b.x;
  const y2 = arrow.b.y;

  const p = fade(frame, arrow.from, arrow.to - arrow.from);
  const ex = x1 + (x2 - x1) * p;
  const ey = y1 + (y2 - y1) * p;
  const arrive = fade(frame, arrow.to - 4, 4);

  const sh = 20;
  const tipX = x2 + s.ux * sh;
  const tipY = y2 + s.uy * sh;
  const half = sh * 0.5;
  const lx = x2 - s.uy * half;
  const ly = y2 + s.ux * half;
  const rx = x2 + s.uy * half;
  const ry = y2 - s.ux * half;

  return (
    <g opacity={p} style={{ pointerEvents: "none" }}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={C.text} strokeWidth={8} />
      <circle cx={ex} cy={ey} r={11} fill={C.text} opacity={1 - arrive} />
      <polygon
        points={`${tipX},${tipY} ${lx},${ly} ${rx},${ry}`}
        fill={C.text}
        opacity={arrive}
      />
    </g>
  );
};

const PathArrow: React.FC<{ arrow: ArrowSpec; frame: number }> = ({
  arrow,
  frame,
}) => {
  const out = 1 - fade(frame, T.boxFrom, T.boxTo - T.boxFrom);
  return (
    <g opacity={out} style={{ pointerEvents: "none" }}>
      <Arrow arrow={arrow} frame={frame} />
    </g>
  );
};

const NodeDot: React.FC<{ spec: Inst; frame: number }> = ({ spec, frame }) => {
  const bal = balanceAt(spec.id, frame);
  const g = glowFor(spec.id, frame);
  const p = pos(spec.id, frame);
  const op = opacity(spec.id, frame);
  const halo = g ? `${g.color}${g.glowIn > 0.6 ? "cc" : "88"}` : "transparent";
  const spread = g ? 70 * g.glowIn : 0;

  return (
    <AbsoluteFill
      style={{
        left: p.x - R,
        top: p.y - R,
        width: R * 2,
        height: R * 2,
        opacity: op,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -16,
          top: -16,
          width: R * 2 + 32,
          height: R * 2 + 32,
          borderRadius: "50%",
          background: halo,
          boxShadow: g ? `0 0 ${spread + 12}px ${g.color}` : "none",
          transform: `scale(${g ? 0.85 + g.glowIn * 0.3 : 1})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: R * 2,
          height: R * 2,
          borderRadius: "50%",
          background: spec.color,
          border: `3px solid #ffffff44`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#0b0e14",
          fontWeight: 800,
          fontSize: 24,
          fontFamily: MONO,
        }}
      >
        {bal}
      </div>
      <div
        style={{
          position: "absolute",
          left: -20,
          top: R * 2 + 8,
          width: R * 2 + 40,
          textAlign: "center",
          color: C.text,
          fontSize: 18,
          fontWeight: 600,
          fontFamily: FONT,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {spec.person}
      </div>
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{ bubble: BubbleSpec; frame: number }> = ({
  bubble,
  frame,
}) => {
  const op = fade(frame, bubble.from, 6) * (1 - fade(frame, bubble.to - 8, 8));
  const p = pos(bubble.id, frame);
  const w = bubble.text.length * 13 + 30;

  return (
    <AbsoluteFill style={{ opacity: op }}>
      <div
        style={{
          position: "absolute",
          left: p.x - w / 2,
          top: p.y - R - 66,
          background: "#1a2230",
          border: `2px solid ${C.muted}`,
          borderRadius: 14,
          padding: "10px 14px",
          color: C.text,
          fontSize: 22,
          fontWeight: 700,
          fontFamily: FONT,
          letterSpacing: 1,
          whiteSpace: "nowrap",
        }}
      >
        {bubble.text}
      </div>
      <div
        style={{
          position: "absolute",
          left: p.x - 8,
          top: p.y - R - 12,
          width: 16,
          height: 16,
          background: "#1a2230",
          borderRight: `2px solid ${C.muted}`,
          borderBottom: `2px solid ${C.muted}`,
          transform: "rotate(45deg)",
        }}
      />
    </AbsoluteFill>
  );
};

export const CassisVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const boxOpacity = fade(frame, T.boxFrom, T.boxTo - T.boxFrom);

  const sendArrows: ArrowSpec[] = HOP_IDS.map((_, i) => {
    const cx = BOX_CENTERS[i];
    return {
      a: { x: cx, y: TOP_NODE_Y + R },
      b: { x: cx, y: HTLC_Y - HTLC_H / 2 },
      from: hopArrowFrom(i),
      to: hopArrowFrom(i) + 15,
    };
  });

  const settleArrows: ArrowSpec[] = [0, 1, 2, 3].map((i) => {
    const cx = BOX_CENTERS[i];
    return {
      a: { x: cx, y: HTLC_Y + HTLC_H / 2 },
      b: { x: cx, y: BOTTOM_NODE_Y - R },
      from: T.settleFrom,
      to: T.settleTo,
    };
  });

  const pathArrows: ArrowSpec[] = [
    { a: inst("alice").route, b: inst("bob1").route, from: 150, to: 170 },
    { a: inst("bob1").route, b: inst("carol1").route, from: 180, to: 200 },
    { a: inst("carol1").route, b: inst("david1").route, from: 210, to: 230 },
    { a: inst("david1").route, b: inst("ernest").route, from: 240, to: 260 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: "absolute", inset: 0 }}
      >
        {BOXES.map((box, i) => (
          <Box
            key={box.id}
            box={box}
            index={i}
            opacity={boxOpacity}
            frame={frame}
          />
        ))}
        {pathArrows.map((arrow, i) => (
          <PathArrow key={`p${i}`} arrow={arrow} frame={frame} />
        ))}
        {sendArrows.map((arrow, i) => (
          <Arrow key={`s${i}`} arrow={arrow} frame={frame} />
        ))}
        {settleArrows.map((arrow, i) => (
          <Arrow key={`st${i}`} arrow={arrow} frame={frame} />
        ))}
      </svg>

      {ALL.map((spec) => (
        <NodeDot key={spec.id} spec={spec} frame={frame} />
      ))}

      {BUBBLES.map((bubble, i) => (
        <Bubble key={i} bubble={bubble} frame={frame} />
      ))}
    </AbsoluteFill>
  );
};
