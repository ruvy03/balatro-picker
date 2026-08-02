"use client";
import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float iTime;
  uniform vec2 iResolution;

  #define SPIN_ROTATION -2.0
  #define SPIN_SPEED 7.0
  #define OFFSET vec2(0.0)
  #define COLOUR_1 vec4(0.871, 0.267, 0.231, 1.0)
  #define COLOUR_2 vec4(0.0, 0.42, 0.706, 1.0)
  #define COLOUR_3 vec4(0.086, 0.137, 0.145, 1.0)
  #define CONTRAST 3.5
  #define LIGTHING 0.4
  #define SPIN_AMOUNT 0.25
  #define PIXEL_FILTER 745.0
  #define SPIN_EASE 1.0
  #define PI 3.14159265359
  #define IS_ROTATE false

  vec4 effect(vec2 screenSize, vec2 screen_coords) {
    float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
    vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy) - OFFSET;
    float uv_len = length(uv);

    float speed = (SPIN_ROTATION*SPIN_EASE*0.2);
    if(IS_ROTATE){
       speed = iTime * speed;
    }
    speed += 302.2;
    float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len + (1. - 1.*SPIN_AMOUNT));
    vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
    uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

    uv *= 30.;
    speed = iTime*(SPIN_SPEED);
    vec2 uv2 = vec2(uv.x+uv.y);

    for(int i=0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
        uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
    }

    float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2);
    float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
    float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
    float c2p = max(0.,1. - contrast_mod*abs(paint_res));
    float c3p = 1. - min(1., c1p + c2p);
    float light = (LIGTHING - 0.2)*max(c1p*5. - 4., 0.) + LIGTHING*max(c2p*5. - 4., 0.);
    return (0.3/CONTRAST)*COLOUR_1 + (1. - 0.3/CONTRAST)*(COLOUR_1*c1p + COLOUR_2*c2p + vec4(c3p*COLOUR_3.rgb, c3p*COLOUR_1.a)) + light;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    fragCoord.y = iResolution.y - fragCoord.y;
    gl_FragColor = effect(iResolution.xy, fragCoord);
  }
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl, vs, fs) {
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// Fixed (non-random) layout so server/client renders match exactly —
// keeps these purely decorative, low-opacity, and out of the way of content.
const FLOATING_SUITS = [
  { ch: "♠", top: "12%", left: "7%", size: 34, dur: 9, delay: 0, dx: 18, rotA: -8, rotB: 10, color: "rgba(255,255,255,0.09)" },
  { ch: "♥", top: "70%", left: "5%", size: 26, dur: 7.5, delay: 1.2, dx: -14, rotA: 6, rotB: -8, color: "rgba(231,76,60,0.14)" },
  { ch: "♦", top: "20%", left: "93%", size: 30, dur: 8.5, delay: 0.6, dx: -18, rotA: 5, rotB: -10, color: "rgba(52,152,219,0.14)" },
  { ch: "♣", top: "80%", left: "91%", size: 28, dur: 10, delay: 2, dx: 14, rotA: -6, rotB: 9, color: "rgba(255,255,255,0.09)" },
  { ch: "♠", top: "46%", left: "3%", size: 20, dur: 6.5, delay: 0.3, dx: 10, rotA: 10, rotB: -6, color: "rgba(255,255,255,0.07)" },
  { ch: "♦", top: "90%", left: "42%", size: 22, dur: 9.5, delay: 1.8, dx: -12, rotA: -5, rotB: 8, color: "rgba(52,152,219,0.1)" },
  { ch: "♥", top: "6%", left: "58%", size: 24, dur: 8, delay: 2.4, dx: 16, rotA: 7, rotB: -9, color: "rgba(231,76,60,0.1)" },
  { ch: "♣", top: "58%", left: "96%", size: 20, dur: 7, delay: 0.9, dx: -10, rotA: -9, rotB: 6, color: "rgba(255,255,255,0.07)" },
];

// Static layered-gradient look modeled on majorleaguebalatro.com's own
// background: a diagonal base wash plus scattered radial "nebula" blobs.
// Their original CSS relies on farthest-corner sizing tuned for a much
// smaller container; explicit percentage sizes keep the blobs reading as
// distinct glows instead of washing out over a full viewport.
const NEBULA_BACKGROUND = [
  "radial-gradient(ellipse 45% 55% at 15% 80%, rgba(30,80,180,0.55), transparent 70%)",
  "radial-gradient(ellipse 40% 45% at 78% 12%, rgba(170,40,130,0.5), transparent 70%)",
  "radial-gradient(ellipse 50% 55% at 90% 75%, rgba(150,25,45,0.55), transparent 70%)",
  "radial-gradient(ellipse 45% 50% at 50% 55%, rgba(25,70,170,0.4), transparent 70%)",
  "radial-gradient(ellipse 40% 45% at 15% 15%, rgba(15,50,110,0.6), transparent 70%)",
  "radial-gradient(ellipse 45% 50% at 85% 90%, rgba(130,25,85,0.45), transparent 70%)",
  "linear-gradient(135deg, #0a1a3a 0%, #1a3a6a 25%, #2a1a4a 50%, #6a1020 75%, #4a0a1a 100%)",
].join(", ");

export default function BalatroBackground({ variant = "shader" }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    if (variant !== "shader") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = createProgram(gl, vs, fs);
    if (!program) return;

    // Full-screen quad
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, "a_position");
    const timeLoc = gl.getUniformLocation(program, "iTime");
    const resLoc = gl.getUniformLocation(program, "iResolution");

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const startTime = performance.now();

    const render = () => {
      const t = (performance.now() - startTime) / 1000;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(timeLoc, t);
      gl.uniform2f(resLoc, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(posBuffer);
    };
  }, [variant]);

  return (
    <>
      {variant === "shader" ? (
        <canvas
          ref={canvasRef}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            width: "100%",
            height: "100%",
          }}
        />
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background: NEBULA_BACKGROUND,
            animation: "nebulaDrift 20s ease-in-out infinite",
          }}
        />
      )}

      {/* Ambient floating suit glyphs for depth */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {FLOATING_SUITS.map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: s.top,
              left: s.left,
              fontSize: s.size,
              color: s.color,
              fontFamily: "var(--font-balatro)",
              lineHeight: 1,
              "--dx": `${s.dx}px`,
              "--rot-a": `${s.rotA}deg`,
              "--rot-b": `${s.rotB}deg`,
              animation: `suitDrift ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          >
            {s.ch}
          </div>
        ))}
      </div>

      {/* Vignette to focus attention toward the center — the shader is
          uniformly bright and needs it, but it would just wash out the
          nebula variant's own edge-positioned color blobs. */}
      {variant === "shader" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(5,5,15,0.35) 75%, rgba(2,2,10,0.62) 100%)",
          }}
        />
      )}
    </>
  );
}
