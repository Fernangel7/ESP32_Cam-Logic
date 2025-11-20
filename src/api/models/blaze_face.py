# import cv2
# import face_recognition
# import os
# import numpy as np

# # Cargar imágenes conocidas
# known_face_encodings = []
# known_face_names = []

# for filename in os.listdir("known_faces"):
#     if filename.endswith(".jpg") or filename.endswith(".png"):
#         image = face_recognition.load_image_file(f"known_faces/{filename}")
#         encoding = face_recognition.face_encodings(image)[0]
#         known_face_encodings.append(encoding)
#         known_face_names.append(os.path.splitext(filename)[0])

# # Inicializar cámara
# cap = cv2.VideoCapture(0)

# while True:
#     ret, frame = cap.read()
#     if not ret:
#         break

#     # Convertir BGR a RGB
#     rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

#     # Detectar caras y generar embeddings
#     face_locations = face_recognition.face_locations(rgb_frame)
#     face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

#     for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
#         # Comparar con caras conocidas
#         matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
#         name = "Unknown"

#         # Elegir el primero que coincida
#         face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
#         if len(face_distances) > 0:
#             best_match_index = np.argmin(face_distances)
#             if matches[best_match_index]:
#                 name = known_face_names[best_match_index]

#         # Dibujar rectángulo y nombre
#         cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
#         cv2.putText(frame, name, (left, top-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0,255,0), 2)

#     cv2.imshow("Facial Recognition", frame)

#     if cv2.waitKey(1) & 0xFF == 27:  # Esc para salir
#         break

# cap.release()
# cv2.destroyAllWindows()


# import sys
# import json

# try:
#     # leer todo el stdin
#     data = sys.stdin.read()
#     payload = json.loads(data)

#     # ------- VALIDACIÓN -------

#     required_fields = ["objective", "compare_with"]

#     for field in required_fields:
#         if field not in payload:
#             print(json.dumps({
#                 "status": "error",
#                 "message": f"Missing field: {field}"
#             }))
#             sys.exit(0)

#     # Si quieres validar más profundamente:
#     # if "nn_api" not in payload["server"]: ...

#     # ------- TODO OK -------
#     print(json.dumps({
#         "status": "ok",
#         "message": "JSON recibido correctamente",
#         "received_keys": list(payload.keys())
#     }))

# except Exception as e:
#     print(json.dumps({
#         "status": "error",
#         "message": str(e)
#     }))















import sys
import json
import face_recognition
import numpy as np
import os

def load_face_encoding(image_path):
    """Return face encoding from an image path or None."""
    try:
        img = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(img)
        return encodings[0] if len(encodings) > 0 else None
    except Exception as e:
        print(f"Error loading {image_path}: {e}")
        return None
    
def main():
    # Leer JSON desde stdin
    raw = sys.stdin.read()
    data = json.loads(raw)

    drive_paths = data["drive_paths"]          # Array de imágenes en Google Drive
    target_image_path = data["target_image"]   # Imagen a comparar

    # ---- Cargar imagen objetivo ----
    target_encoding = load_face_encoding(target_image_path)
    if target_encoding is None:
        print(json.dumps({
            "status": "error",
            "message": "No se pudo leer o detectar rostro en la imagen objetivo"
        }))
        return

    known_encodings = []
    known_names = []

    # ---- Cargar imágenes desde Google Drive ----
    for path in drive_paths:
        encoding = load_face_encoding(path)
        if encoding is not None:
            known_encodings.append(encoding)
            known_names.append(os.path.basename(path))
        else:
            print(f"Advertencia: no se detectó rostro en {path}")

    if len(known_encodings) == 0:
        print(json.dumps({
            "status": "error",
            "message": "No se detectaron rostros en las imágenes de Drive"
        }))
        return

    # ---- Comparación ----
    results = face_recognition.compare_faces(known_encodings, target_encoding)
    distances = face_recognition.face_distance(known_encodings, target_encoding)

    # Buscar mejor coincidencia
    best_index = np.argmin(distances)
    best_match = results[best_index]

    if best_match:
        print(json.dumps({
            "status": "ok",
            "match": known_names[best_index],
            "distance": float(distances[best_index])
        }))
    else:
        print(json.dumps({
            "status": "ok",
            "match": "Unknown"
        }))


if __name__ == "__main__":
    main()



# try:
#     # leer todo el stdin
#     data = sys.stdin.read()
#     payload = json.loads(data)

#     # ------- VALIDACIÓN -------

#     required_fields = ["objective", "compare_with"]

#     for field in required_fields:
#         if field not in payload:
#             print(json.dumps({
#                 "status": "error",
#                 "message": f"Missing field: {field}"
#             }))
#             sys.exit(0)

#     # Si quieres validar más profundamente:
#     # if "nn_api" not in payload["server"]: ...

#     # ------- TODO OK -------
#     print(json.dumps({
#         "status": "ok",
#         "message": "JSON recibido correctamente",
#         "received_keys": list(payload.keys())
#     }))

# except Exception as e:
#     print(json.dumps({
#         "status": "error",
#         "message": str(e)
#     }))
