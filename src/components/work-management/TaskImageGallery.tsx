import { useState } from 'react';
import { TaskImage } from '@/types/work-management';
import { ImageUploader } from '@/components/discussions/ThreadForm/ImageUploader';

interface TaskImageGalleryProps {
  images: TaskImage[];
  onChange: (images: TaskImage[]) => void;
  readonly?: boolean;
}

export default function TaskImageGallery({ images, onChange, readonly = false }: TaskImageGalleryProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUploadChange = (files: File[]) => {
    const newImages = files.map(file => ({
      id: Math.random().toString(),
      url: URL.createObjectURL(file),
      thumbnail: URL.createObjectURL(file),
      alt: file.name
    }));
    onChange([...images, ...newImages]);
    setIsEditing(false);
  };

  if (isEditing && !readonly) {
    return (
      <div className="space-y-2">
        <ImageUploader value={[]} onChange={handleUploadChange} />
        <button onClick={() => setIsEditing(false)} className="text-sm text-terracotta">Cancel</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.map(img => (
            <img key={img.id} src={img.url} alt={img.alt || 'Task image'} className="w-full h-32 object-cover rounded-lg border border-sage/20" />
          ))}
        </div>
      ) : (
        <p className="text-sm text-forest/50 italic">No images attached.</p>
      )}
      {!readonly && (
        <button onClick={() => setIsEditing(true)} className="text-sm text-terracotta hover:underline font-medium">
          + Add Image
        </button>
      )}
    </div>
  );
}
