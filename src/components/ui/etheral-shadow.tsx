import { animate, type AnimationPlaybackControls, useMotionValue } from 'framer-motion'
import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react'

interface ResponsiveImage {
  src: string
  alt?: string
  srcSet?: string
}

interface AnimationConfig {
  preview?: boolean
  scale: number
  speed: number
}

interface NoiseConfig {
  opacity: number
  scale: number
}

interface ShadowOverlayProps {
  type?: 'preset' | 'custom'
  presetIndex?: number
  customImage?: ResponsiveImage
  sizing?: 'fill' | 'stretch'
  color?: string
  animation?: AnimationConfig
  noise?: NoiseConfig
  style?: CSSProperties
  className?: string
  title?: string
  children?: ReactNode
}

function mapRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
  if (fromLow === fromHigh) return toLow
  return toLow + ((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow)
}

const palettes = [
  'radial-gradient(ellipse at 50% 50%, #b8a8ff 0%, #8570e0 34%, #ffc6a7 68%, transparent 78%)',
  'radial-gradient(ellipse at 50% 50%, #a5e8d2 0%, #84b5e8 38%, #c5a6f3 67%, transparent 78%)',
  'radial-gradient(ellipse at 50% 50%, #ffe0a8 0%, #f2a8aa 36%, #b7a0ed 67%, transparent 78%)',
]

export function Component({
  type = 'preset',
  presetIndex = 0,
  sizing = 'fill',
  color = 'rgba(128, 128, 128, 1)',
  customImage,
  animation,
  noise,
  style,
  className,
  title = 'Ethereal Shadows',
  children,
}: ShadowOverlayProps) {
  const id = `shadowoverlay-${useId().replace(/:/g, '')}`
  const animationEnabled = Boolean(animation && animation.scale > 0)
  const colorMatrixRef = useRef<SVGFEColorMatrixElement>(null)
  const hue = useMotionValue(0)
  const playback = useRef<AnimationPlaybackControls | null>(null)
  const scale = animation ? mapRange(animation.scale, 1, 100, 20, 100) : 0
  const duration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1

  useEffect(() => {
    if (!animationEnabled || !colorMatrixRef.current) return
    playback.current?.stop()
    hue.set(0)
    playback.current = animate(hue, 360, {
      duration: duration / 25,
      repeat: Infinity,
      ease: 'linear',
      onUpdate: (value) => colorMatrixRef.current?.setAttribute('values', String(value)),
    })
    return () => playback.current?.stop()
  }, [animationEnabled, duration, hue])

  const backgroundImage = type === 'custom' && customImage
    ? `url("${customImage.src}")`
    : palettes[((presetIndex % palettes.length) + palettes.length) % palettes.length]

  return (
    <div className={className} style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}>
      <div className="shadow-overlay-art" style={{
        position: 'absolute',
        inset: -scale,
        filter: animationEnabled ? `url(#${id}) blur(4px)` : 'none',
      }}>
        {animationEnabled && (
          <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <filter id={id}>
                <feTurbulence result="undulation" numOctaves="2" baseFrequency={`${mapRange(animation?.scale ?? 1, 0, 100, .001, .0005)},${mapRange(animation?.scale ?? 1, 0, 100, .004, .002)}`} seed="0" type="turbulence" />
                <feColorMatrix ref={colorMatrixRef} in="undulation" type="hueRotate" values="0" />
                <feColorMatrix in="dist" result="circulation" type="matrix" values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0" />
                <feDisplacementMap in="SourceGraphic" in2="circulation" scale={scale} result="dist" />
                <feDisplacementMap in="dist" in2="undulation" scale={scale} result="output" />
              </filter>
            </defs>
          </svg>
        )}
        <div
          role={type === 'custom' ? 'img' : undefined}
          aria-label={type === 'custom' ? customImage?.alt : undefined}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: color,
            backgroundImage: customImage?.src ? `url("${customImage.src}")` : backgroundImage,
            backgroundPosition: 'center',
            backgroundSize: sizing === 'stretch' ? '100% 100%' : 'cover',
            backgroundRepeat: 'no-repeat',
            maskImage: 'radial-gradient(ellipse at center, #000 14%, rgba(0,0,0,.9) 37%, transparent 76%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, #000 14%, rgba(0,0,0,.9) 37%, transparent 76%)',
          }}
        />
      </div>
      {(children || title) && (
        <div className="shadow-overlay-content">
          {children ?? <h2>{title}</h2>}
        </div>
      )}
      {noise && noise.opacity > 0 && (
        <div aria-hidden="true" className="shadow-overlay-noise" style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 180 180%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.9%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27 opacity=%27.35%27/%3E%3C/svg%3E")',
          backgroundSize: `${noise.scale * 200}px`,
          opacity: noise.opacity / 2,
          pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}
