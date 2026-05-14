export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script 
        src="https://aframe.io/releases/1.4.0/aframe.min.js"
        async
      />
      <script 
        src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"
        async
      />
      {children}
    </>
  )
}
