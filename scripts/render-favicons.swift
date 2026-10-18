import Cocoa

let svgPath = "public/favicon.svg"
guard let svgImage = NSImage(contentsOfFile: svgPath) else {
    print("Failed to load SVG with NSImage")
    exit(1)
}
print("Successfully loaded SVG! Native size: \(svgImage.size)")

func renderPng(size: CGFloat, dest: String) {
    let targetSize = NSSize(width: size, height: size)
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil,
                               pixelsWide: Int(size),
                               pixelsHigh: Int(size),
                               bitsPerSample: 8,
                               samplesPerPixel: 4,
                               hasAlpha: true,
                               isPlanar: false,
                               colorSpaceName: .deviceRGB,
                               bytesPerRow: 0,
                               bitsPerPixel: 0)!
    rep.size = targetSize
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    
    // Draw white background
    NSColor.white.setFill()
    NSRect(origin: .zero, size: targetSize).fill()
    
    // Draw SVG
    svgImage.draw(in: NSRect(origin: .zero, size: targetSize),
                  from: NSRect(origin: .zero, size: svgImage.size),
                  operation: .sourceOver,
                  fraction: 1.0)
    
    NSGraphicsContext.restoreGraphicsState()
    
    if let pngData = rep.representation(using: .png, properties: [:]) {
        try? pngData.write(to: URL(fileURLWithPath: dest))
        print("Wrote \(dest) (\(Int(size))x\(Int(size)))")
    }
}

renderPng(size: 512, dest: "public/favicon-512.png")
renderPng(size: 180, dest: "public/apple-touch-icon.png")
renderPng(size: 64, dest: "public/favicon-64.png")
renderPng(size: 32, dest: "public/favicon.png")
renderPng(size: 32, dest: "public/favicon.ico")
