
export class VideoCapture {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private frameInterval: number | null = null;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
  }

  async startCapture(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      });
      
      console.log('Video capture started successfully');
      return this.stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw new Error('No se pudo acceder a la cámara');
    }
  }

  startRecording(onFrameCapture: (imageData: string) => void): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.stream) {
        reject(new Error('No hay stream de video disponible'));
        return;
      }

      this.chunks = [];
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        resolve(blob);
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error('Error en la grabación'));
      };

      // Capturar frame cada segundo
      const videoElement = document.createElement('video');
      videoElement.srcObject = this.stream;
      videoElement.play();

      videoElement.onloadedmetadata = () => {
        this.canvas.width = videoElement.videoWidth;
        this.canvas.height = videoElement.videoHeight;

        this.frameInterval = window.setInterval(() => {
          this.context.drawImage(videoElement, 0, 0);
          const imageData = this.canvas.toDataURL('image/jpeg', 0.8);
          onFrameCapture(imageData);
        }, 1000); // Cada segundo

        this.mediaRecorder!.start();
        
        // Detener después de 15 segundos
        setTimeout(() => {
          this.stopRecording();
        }, 15000);
      };
    });
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    if (this.frameInterval) {
      clearInterval(this.frameInterval);
      this.frameInterval = null;
    }
  }

  stopCapture(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}
