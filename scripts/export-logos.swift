import Cocoa

let brainDir = "/Users/main_nikita/.gemini/antigravity/brain/19ec4fe0-28cc-4267-8406-daf3abbc648b"
let outDir = "/Users/main_nikita/Downloads/пространство-проектов/public/assets/branding"

try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

// 1. Export Monogram PNG
let monoPath = "\(brainDir)/maison_arome_monogram_icon_1791653181845.jpg"
if let monoImage = NSImage(contentsOfFile: monoPath),
   let tiffData = monoImage.tiffRepresentation,
   let bitmap = NSBitmapImageRep(data: tiffData),
   let pngData = bitmap.representation(using: .png, properties: [:]) {
    let dest = "\(outDir)/maison-arome-monogram.png"
    try? pngData.write(to: URL(fileURLWithPath: dest))
    print("Exported monogram to \(dest)")
}

// 2. Export Text typography cropped PNG with white background
let fullPath = "\(brainDir)/maison_arome_final_logo_1791652507751.jpg"
if let fullImage = NSImage(contentsOfFile: fullPath) {
    // In full image (1264x848):
    // Let's get actual image rep pixel size
    let reps = fullImage.representations
    let pixelW = reps.first?.pixelsWide ?? 1264
    let pixelH = reps.first?.pixelsHigh ?? 848
    
    // In normalized coords or pixel coords:
    // Crop the text on the right
    let cropX: CGFloat = CGFloat(pixelW) * 0.38
    let cropY: CGFloat = CGFloat(pixelH) * 0.30
    let cropW: CGFloat = CGFloat(pixelW) * 0.58
    let cropH: CGFloat = CGFloat(pixelH) * 0.40
    
    let targetSize = NSSize(width: cropW, height: cropH)
    let cropped = NSImage(size: targetSize)
    cropped.lockFocus()
    NSColor.white.setFill()
    NSRect(origin: .zero, size: targetSize).fill()
    
    fullImage.draw(in: NSRect(origin: .zero, size: targetSize),
                   from: NSRect(x: cropX, y: CGFloat(pixelH) - cropY - cropH, width: cropW, height: cropH),
                   operation: .sourceOver, fraction: 1.0)
    cropped.unlockFocus()
    
    if let cropTiff = cropped.tiffRepresentation,
       let cropBitmap = NSBitmapImageRep(data: cropTiff),
       let cropPng = cropBitmap.representation(using: .png, properties: [:]) {
        let dest = "\(outDir)/maison-arome-text.png"
        try? cropPng.write(to: URL(fileURLWithPath: dest))
        print("Exported text logo to \(dest)")
    }
}
