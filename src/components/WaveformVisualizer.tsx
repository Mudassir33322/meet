/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  status: 'idle' | 'listening' | 'speaking' | 'loading' | 'completed';
  isAudioOn: boolean;
}

export function WaveformVisualizer({ status, isAudioOn }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(new Array(16).fill(10));

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (status === 'speaking') {
      // Simulate active Speech Synthesis output levels
      intervalId = setInterval(() => {
        setBars(
          new Array(16).fill(0).map(() => Math.floor(Math.random() * 80) + 20)
        );
      }, 80);
    } else if (status === 'listening' && isAudioOn) {
      // Simulate user microphone active waves
      intervalId = setInterval(() => {
        setBars(
          new Array(16).fill(0).map(() => Math.floor(Math.random() * 50) + 15)
        );
      }, 100);
    } else if (status === 'loading') {
      // Slowly breathing pattern
      let frame = 0;
      intervalId = setInterval(() => {
        frame++;
        setBars(
          new Array(16).fill(0).map((_, i) => {
            const cycle = Math.sin(frame * 0.3 + i * 0.4);
            return Math.floor((cycle + 1) * 20) + 10;
          })
        );
      }, 100);
    } else {
      // Idle state
      setBars(new Array(16).fill(0).map((_, i) => 8 + Math.sin(i * 0.5) * 4));
    }

    return () => clearInterval(intervalId);
  }, [status, isAudioOn]);

  // Determine themes for the center orb based on status
  const getOrbStyle = () => {
    switch (status) {
      case 'speaking':
        return {
          bg: 'bg-emerald-50 border-emerald-300',
          ring: 'ring-emerald-200/40',
          glow: 'shadow-[0_0_50px_rgba(16,185,129,0.2)]',
          label: 'AI Speaking (Pixgenix Agent)',
          labelColor: 'text-emerald-700'
        };
      case 'listening':
        return isAudioOn
          ? {
              bg: 'bg-rose-50 border-rose-300',
              ring: 'ring-rose-200/40',
              glow: 'shadow-[0_0_50px_rgba(244,63,94,0.25)]',
              label: 'Listening to you...',
              labelColor: 'text-rose-600'
            }
          : {
              bg: 'bg-slate-50 border-slate-300',
              ring: 'ring-slate-200/20',
              glow: 'shadow-none',
              label: 'Voice Controls Ready',
              labelColor: 'text-slate-500'
            };
      case 'loading':
        return {
          bg: 'bg-amber-50 border-amber-300',
          ring: 'ring-amber-200/45',
          glow: 'shadow-[0_0_40px_rgba(245,158,11,0.2)]',
          label: 'Pixgenix Agent thinking...',
          labelColor: 'text-amber-700'
        };
      case 'completed':
        return {
          bg: 'bg-teal-50 border-teal-300',
          ring: 'ring-teal-200/40',
          glow: 'shadow-[0_0_40px_rgba(20,184,166,0.2)]',
          label: 'Deal Signed & Saved',
          labelColor: 'text-teal-700'
        };
      default:
        return {
          bg: 'bg-cyan-50 border-cyan-300',
          ring: 'ring-cyan-200/20',
          glow: 'shadow-sm',
          label: 'System Ready',
          labelColor: 'text-cyan-800'
        };
    }
  };

  const orb = getOrbStyle();

  return (
    <div id="voice-visualizer-container" className="flex flex-col items-center justify-center py-6">
      {/* Dynamic Animated Central Orb */}
      <div className="relative mb-6">
        <div
          className={`w-36 h-36 rounded-full border-2 flex items-center justify-center transition-all duration-500 ring-8 ${orb.bg} ${orb.ring} ${orb.glow}`}
        >
          {/* Internal rotating core */}
          <div
            className={`w-28 h-28 rounded-full border border-dashed animate-[spin_12s_linear_infinite] flex items-center justify-center ${
              status === 'speaking' || status === 'listening'
                ? 'border-cyan-500'
                : 'border-slate-300'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-full bg-white flex items-center justify-center border font-mono text-xl ${
                status === 'speaking'
                  ? 'border-emerald-400 text-emerald-600 animate-pulse'
                  : status === 'listening' && isAudioOn
                  ? 'border-rose-400 text-rose-600 animate-pulse'
                  : 'border-cyan-500/50 text-cyan-700'
              }`}
            >
              {status === 'speaking' ? 'AI' : status === 'listening' && isAudioOn ? 'MIC' : 'OK'}
            </div>
          </div>
        </div>

        {/* Ambient floating points */}
        <div className="absolute top-1/2 left-1/2 -ml-2 -mt-2 w-4 h-4 rounded-full bg-cyan-400/30 blur-md animate-ping" />
      </div>

      {/* STT/TTS Stereo Audio Amplitude Waveform Bars */}
      <div className="flex items-center justify-center h-16 gap-1 w-72 mb-4 bg-slate-50 rounded-xl px-4 border border-slate-200">
        {bars.map((height, i) => (
          <div
            key={i}
            id={`waveform-bar-${i}`}
            className={`w-1.5 rounded-full transition-all duration-75 ${
              status === 'speaking'
                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                : status === 'listening' && isAudioOn
                ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                : status === 'loading'
                ? 'bg-gradient-to-t from-amber-600 to-amber-400'
                : 'bg-slate-300'
            }`}
            style={{
              height: `${Math.max(10, height)}%`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
      </div>

      {/* Voice Assistant Current State Text */}
      <div className="text-center font-mono">
        <span className={`text-sm font-semibold tracking-wide uppercase ${orb.labelColor}`}>
          ● {orb.label}
        </span>
      </div>
    </div>
  );
}
