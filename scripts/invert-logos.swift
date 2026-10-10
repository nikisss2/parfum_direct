import Cocoa

let brandingDir = "/Users/main_nikita/Downloads/пространство-проектов/public/assets/branding"

func processLogo(filename: String, outName: String) {
    let inPath = "\(brandingDir)/\(filename)"
    guard let img = NSImage(contentsOfFile: inPath),
          let tiff = img.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff) else {
        print("Failed to load \(filename)")
        return
    }
    
    let width = rep.pixelsWide
    let height = rep.pixelsHigh
    print("Processing \(filename): \(width)x\(height)")
    
    // Create RGBA bitmap
    guard let outRep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .calibratedRGB,
        bytesPerRow: width * 4,
        bitsPerPixel: 32
    ) else { return }
    
    for y in 0..<height {
        for x in 0..<width {
            let color = rep.colorAt(x: x, y: y) ?? NSColor.white
            let r = color.redComponent
            let g = color.greenComponent
            let b = color.blueComponent
            let a = color.alphaComponent
            
            // Check if this pixel is part of text or background
            // Background is usually white (r>0.9, g>0.9, b>0.9) or transparent (a < 0.1)
            var newAlpha: CGFloat = 0.0
            
            if a < 0.05 {
                // Already transparent
                newAlpha = 0.0
            } else {
                // Grayscale brightness (0 = black, 1 = white)
                let brightness = 0.299 * r + 0.587 * g + 0.114 * b
                // For white text with transparency:
                // If original was black (brightness = 0), alpha should be high (1.0)
                // If original was white (brightness = 1), alpha should be 0.0
                newAlpha = (1.0 - brightness) * a
            }
            
            // Text color is pure white: (1.0, 1.0, 1.0, newAlpha)
            let whitePixel = NSColor(calibratedRed: 1.0, green: 1.0, blue: 1.0, alpha: newAlpha)
            outRep.setColor(whitePixel, atX: x, y: y)
        }
    }
    
    if let pngData = outRep.representation(using: .png, properties: [:]) {
        let dest = "\(brandingDir)/\(outName)"
        try? pngData.write(to: URL(fileURLWithPath: dest))
        print("Exported white transparent logo to \(dest)")
    }
}

processLogo(filename: "логотип_1.png", outName: "логотип_1_white.png")
processLogo(filename: "логотип_2.png", outName: "логотип_2_white.png")
processLogo(filename: "логотип_3.png", outName: "логотип_3_white.png")
