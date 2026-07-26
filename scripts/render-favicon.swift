import AppKit
import Foundation

private let nodes: [CGPoint] = [
  CGPoint(x: 18, y: 12),
  CGPoint(x: 18, y: 28),
  CGPoint(x: 34, y: 18),
  CGPoint(x: 34, y: 32),
  CGPoint(x: 50, y: 25),
  CGPoint(x: 30, y: 47),
  CGPoint(x: 18, y: 52),
  CGPoint(x: 50, y: 47),
]

private let edges: [(Int, Int)] = [
  (0, 1), (0, 2), (1, 2), (2, 3), (1, 3),
  (1, 6), (3, 4), (3, 5), (3, 7), (5, 6),
]

private func render(size: Int, destination: String) throws {
  guard
    let bitmap = NSBitmapImageRep(
      bitmapDataPlanes: nil,
      pixelsWide: size,
      pixelsHigh: size,
      bitsPerSample: 8,
      samplesPerPixel: 4,
      hasAlpha: true,
      isPlanar: false,
      colorSpaceName: .deviceRGB,
      bytesPerRow: 0,
      bitsPerPixel: 0
    ),
    let graphics = NSGraphicsContext(bitmapImageRep: bitmap)
  else {
    throw NSError(domain: "favicon", code: 1)
  }

  NSGraphicsContext.saveGraphicsState()
  NSGraphicsContext.current = graphics

  let context = graphics.cgContext
  context.clear(CGRect(x: 0, y: 0, width: size, height: size))
  let scale = CGFloat(size) / 64
  context.scaleBy(x: scale, y: scale)
  context.translateBy(x: 0, y: 64)
  context.scaleBy(x: 1, y: -1)
  context.setLineCap(.round)
  context.setLineJoin(.round)

  func strokeEdges(color: CGColor, width: CGFloat) {
    context.beginPath()
    for (start, end) in edges {
      context.move(to: nodes[start])
      context.addLine(to: nodes[end])
    }
    context.setStrokeColor(color)
    context.setLineWidth(width)
    context.strokePath()
  }

  strokeEdges(color: NSColor(calibratedWhite: 0.07, alpha: 1).cgColor, width: 5)
  strokeEdges(color: NSColor.white.cgColor, width: 2.5)

  for node in nodes {
    context.setFillColor(NSColor(calibratedWhite: 0.07, alpha: 1).cgColor)
    context.fillEllipse(
      in: CGRect(x: node.x - 6, y: node.y - 6, width: 12, height: 12)
    )
    context.setFillColor(NSColor.white.cgColor)
    context.fillEllipse(
      in: CGRect(x: node.x - 4, y: node.y - 4, width: 8, height: 8)
    )
  }

  NSGraphicsContext.restoreGraphicsState()

  guard let data = bitmap.representation(using: .png, properties: [:]) else {
    throw NSError(domain: "favicon", code: 2)
  }
  try data.write(to: URL(fileURLWithPath: destination))
}

try render(size: 512, destination: "images/favicon.png")
try render(size: 180, destination: "images/apple-touch-icon.png")
try render(size: 32, destination: "images/favicon-32.png")

