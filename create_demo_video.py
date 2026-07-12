#!/usr/bin/env python3
"""
AssetFlow AI Demo - MP4 Video Creator
Converts PNG screenshots into professional MP4 video with transitions
"""

import os
import sys
import cv2
import numpy as np

def create_video_from_images(image_dir, output_file="assetflow_demo.mp4", 
                             duration_per_image=10, fps=30, resolution=(1920, 1080)):
    """
    Create MP4 video from sequential PNG images with fade transitions
    """
    
    print(f"\n[*] Scanning for PNG images in: {image_dir}")
    
    # Find all PNG files and sort them
    images = sorted([img for img in os.listdir(image_dir) 
                    if img.endswith(".png") and img[0].isdigit()])
    
    if not images:
        print("[ERROR] No PNG images found in directory!")
        return False
    
    print(f"[✓] Found {len(images)} images:")
    for img in images:
        print(f"    - {img}")
    
    # Setup video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_file, fourcc, fps, resolution)
    
    if not out.isOpened():
        print("[ERROR] Failed to create video writer")
        return False
    
    print(f"\n[*] Creating video:")
    print(f"    Resolution: {resolution[0]}x{resolution[1]}")
    print(f"    FPS: {fps}")
    print(f"    Duration per image: {duration_per_image}s\n")
    
    total_frames = 0
    frames_per_image = int(duration_per_image * fps)
    fade_duration = int(1 * fps)
    
    for idx, image_file in enumerate(images):
        img_path = os.path.join(image_dir, image_file)
        
        print(f"[{idx+1}/{len(images)}] Processing: {image_file}...", end=" ")
        
        try:
            img = cv2.imread(img_path)
            if img is None:
                print("[SKIP]")
                continue
            
            img = cv2.resize(img, resolution)
            
            # Fade in
            for frame_num in range(fade_duration):
                alpha = frame_num / fade_duration
                black = np.zeros_like(img)
                faded = cv2.addWeighted(img, alpha, black, 1-alpha, 0)
                out.write(faded)
                total_frames += 1
            
            # Full opacity
            for _ in range(frames_per_image - 2 * fade_duration):
                out.write(img)
                total_frames += 1
            
            # Fade out
            for frame_num in range(fade_duration):
                alpha = 1 - (frame_num / fade_duration)
                black = np.zeros_like(img)
                faded = cv2.addWeighted(img, alpha, black, 1-alpha, 0)
                out.write(faded)
                total_frames += 1
            
            print("[✓]")
        
        except Exception as e:
            print(f"[ERROR] {str(e)}")
    
    out.release()
    
    # Stats
    video_duration = total_frames / fps
    file_size = os.path.getsize(output_file) / (1024 * 1024)
    
    print(f"\n[✓] VIDEO CREATED!")
    print(f"    Output: {output_file}")
    print(f"    Duration: {video_duration:.1f} seconds")
    print(f"    File size: {file_size:.1f} MB")
    
    return True

if __name__ == "__main__":
    demo_dir = "assetflow_demo_1783849949"
    
    if not os.path.exists(demo_dir):
        print("\n[ERROR] Demo directory not found!")
        print("[*] Please extract first: tar -xzf assetflow_ai_demo_package.tar.gz")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("   AssetFlow AI - Demo Video Creator")
    print("="*60)
    
    success = create_video_from_images(demo_dir, "assetflow_demo.mp4")
    
    if success:
        print("\n[✓] Ready to share on YouTube, LinkedIn, or email!")
    else:
        print("\n[ERROR] Failed to create video")
    
    sys.exit(0 if success else 1)
