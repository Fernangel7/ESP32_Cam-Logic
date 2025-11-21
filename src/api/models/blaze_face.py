import sys
import json
import os # ¡Importante! Necesario para 'os.path.basename' y para leer archivos

try:
    # Intenta importar las librerías necesarias
    import face_recognition
    import numpy as np
except Exception as e:
    # Si falla, devuelve un JSON de error de importación
    print(json.dumps({"status": "error", "message": f"Error de importación en Python: {e}"}))
    sys.exit(1)

# --- Función Auxiliar ---
# Carga la imagen, detecta el rostro y devuelve la codificación.
def load_face_encoding(image_path):
    # Asegúrate de que el archivo exista antes de intentar cargarlo
    if not os.path.exists(image_path):
        print(f"Error: La ruta de imagen no existe: {image_path}", file=sys.stderr)
        return None
        
    try:
        # Cargar imagen
        image = face_recognition.load_image_file(image_path)
        
        # Encontrar todas las codificaciones de rostros en la imagen.
        # Solo tomaremos el primero si hay varios, o None si no hay.
        face_encodings = face_recognition.face_encodings(image)
        
        if len(face_encodings) > 0:
            return face_encodings[0]
        else:
            return None
            
    except Exception as e:
        print(f"Error al procesar la imagen {image_path}: {e}", file=sys.stderr)
        return None


def main():
    raw = sys.stdin.read()
    
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        print(json.dumps({
            "status": "error", 
            "message": "Error al decodificar JSON de la entrada estándar."
        }))
        sys.exit(1)

    # --- CORRECCIÓN CLAVE 1: Extraer la ruta del objeto ---
    # `images_data` ahora es un array de objetos: [{"name": "...", "path": "..."}, ...]
    # Necesitas solo las rutas:
    images_objects = data.get("images_data", [])          
    target_image_object = data.get("target_image")
    
    # Validación inicial de datos
    if not target_image_object or "path" not in target_image_object:
        print(json.dumps({
            "status": "error",
            "message": "Datos de imagen objetivo incompletos o ausentes."
        }))
        return

    # --- CORRECCIÓN CLAVE 2: Usar `path` de los objetos ---
    target_image_path = target_image_object["path"]

    # ---- Cargar imagen objetivo ----
    target_encoding = load_face_encoding(target_image_path)
    if target_encoding is None:
        print(json.dumps({
            "status": "error",
            "message": "No se pudo leer o detectar rostro en la imagen objetivo."
        }))
        return

    known_encodings = []
    known_identifiers = []  # Usará uuid si existe, sino name como fallback

    # ---- Cargar imágenes de comparación ----
    for image_obj in images_objects:
        # Extraer la ruta y posibles identificadores
        path = image_obj.get("path")
        name = image_obj.get("name")
        uuid = image_obj.get("uuid")

        if path and (uuid or name):
            encoding = load_face_encoding(path)
            if encoding is not None:
                known_encodings.append(encoding)
                # Preferir uuid; si no existe, usar name como respaldo
                identifier = uuid if uuid else name
                known_identifiers.append(identifier)
            else:
                ident_txt = uuid if uuid else name if name else "(sin identificador)"
                print(f"Advertencia: no se detectó rostro en la imagen de {ident_txt} ({path})", file=sys.stderr)
        else:
            print("Advertencia: Objeto de imagen en 'images_data' incompleto (falta 'path' o identificador 'uuid/name').", file=sys.stderr)


    if len(known_encodings) == 0:
        print(json.dumps({
            "status": "error",
            "message": "No se detectaron rostros en las imágenes de comparación."
        }))
        return

    # ---- Comparación ----
    # Calcula la distancia euclidiana entre la imagen objetivo y cada rostro conocido.
    distances = face_recognition.face_distance(known_encodings, target_encoding)

    # Buscar mejor coincidencia (la menor distancia)
    best_index = np.argmin(distances)
    
    # Compara si la distancia más corta es considerada una "coincidencia" (por defecto, la librería usa 0.6)
    # También puedes usar face_recognition.compare_faces, pero usar la distancia es más informativo
    # y face_recognition.compare_faces(known_encodings, target_encoding) asume un umbral por ti.
    # En este caso, usaremos el resultado de la distancia más pequeña.

    # Determinar si la mejor coincidencia está por debajo del umbral estándar de 0.6
    # Este es el umbral usado por defecto por face_recognition.compare_faces.
    is_match = distances[best_index] <= 0.6 

    if is_match:
        print(json.dumps({
            "status": "ok",
            "match": known_identifiers[best_index],  # Retorna uuid (o name como fallback si no había uuid)
            "distance": float(distances[best_index])
        }))
    else:
        # No cumple el umbral: se devuelve Unknown y el uuid/name más cercano como best_guess_identifier
        print(json.dumps({
            "status": "ok",
            "match": "Unknown",
            "best_guess_identifier": known_identifiers[best_index],
            "distance": float(distances[best_index])
        }))


if __name__ == "__main__":
    # La validación secundaria que tenías abajo es redundante si solo usas `main()`
    # y depende del formato de JSON que se espera.
    # Si el JSON es el que proporcionaste (con 'images_data' y 'target_image'),
    # entonces el código corregido de `main()` es suficiente.
    main()