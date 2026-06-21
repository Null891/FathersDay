import { Canvas } from '@react-three/fiber'
import Museum from './Museum'
import MusicPlayer from './MusicPlayer'

export default function App() {
  return (
    <>
      <Canvas
        style={{ width: '100vw', height: '100vh' }}
        camera={{ position: [0, 1.7, 6], fov: 75 }}
      >
        <color attach="background" args={['#0f172a']} />
        <Museum />
      </Canvas>
      <MusicPlayer />
    </>
  )
}
