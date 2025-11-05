# 🤖 Detector Facial con IA y Caja Fuerte Conectada

Este proyecto implementa un sistema de seguridad biométrico basado en **reconocimiento facial en la nube**. Controla una caja fuerte física usando un **ESP32-CAM**, un **servomotor** y una **pantalla OLED**.

La lógica central es gestionada por una **aplicación web (Express.js)** que maneja usuarios, se conecta a una base de datos **MongoDB Atlas** y consume una **API de IA (Flask)** desplegada en **Google Colab** para el procesamiento de visión artificial.

> **Propósito del Proyecto:** Desarrollar un detector de rostros que identifique y resalte la presencia de rostros humanos [...] usando herramientas de código libre [...] y como resultado una caja fuerte se abrirá automáticamente.


*(Demo del proyecto: Se muestra el ESP32, la app web y el desbloqueo del servo)*

---

## 🚀 Enlaces en Vivo (Demos)

Puedes probar los componentes desplegados en los siguientes enlaces:

* **Aplicación Web (Express.js):** `http://(URL_DE_TU_APP_HOSTEADA)`
* **API de IA (Flask/Colab):** `http://(URL_TEMPORAL_DE_NGROK_O_COLAB)`
    *(Nota: El enlace de Google Colab/ngrok es temporal y puede cambiar cada vez que se reinicia el notebook.)*

---

## 🏛️ Arquitectura del Sistema y Flujo de Datos

Este proyecto está desacoplado en tres componentes principales que se comunican por APIs.



```markdown
`branch: app`
Auth_Service/
├── .gitignore
├── LICENSE
├── README.md
├── package-lock.json
├── package.json
└── src/
    ├── app.js
    ├── controllers/
    ├── db/
    ├── middlewares/
    ├── models/
    ├── public/
    ├── routes/
    ├── schemas/
    ├── utils/
    └── views/

`branch: embedded``
Auth_Service/
├── .gitignore
├── LICENSE
└── README.md

`branch: nn_model``
Auth_Service/
├── .gitignore
├── LICENSE
└── README.md
```


### 1. Registro de Nuevo Usuario
El registro se maneja a través de la aplicación web:
1.  El usuario accede a la **Web App (Express.js)** y se registra en el formulario de login.
2.  Se solicitan datos extensos para una identificación correcta.
3.  Las imágenes de perfil/autenticación se suben a **Imgur** para evitar la saturación del servidor.
4.  La **Web App** guarda la información del usuario (incluyendo las URLs de Imgur) en la base de datos **MongoDB Atlas**.

### 2. Proceso de Autenticación (Desbloqueo)
1.  **Captura (Hardware):** El **ESP32-CAM** detecta movimiento y captura una imagen del rostro.
2.  **Petición (Hardware -> Web App):** El ESP32 envía la imagen a un endpoint específico de la **API interna** de la **Web App (Express.js)**.
3.  **Orquestación (Web App -> IA):** La Web App recibe la imagen. A su vez, realiza una petición a la **API externa de IA (Flask)**, que está corriendo en **Google Colab**, enviándole la imagen a analizar.
4.  **Análisis (IA):** La **API de Flask** en Colab (usando visión artificial) procesa la imagen, la compara con los datos de acceso (almacenados en **Google Drive**) y determina si el rostro está autorizado.
5.  **Respuesta (IA -> Web App):** La API de Colab devuelve una respuesta (ej. `{"status": "concedido", "usuario": "Kevin"}`).
6.  **Acción (Web App -> Hardware):** La Web App recibe la respuesta de la IA, registra el intento de acceso en **MongoDB Atlas**, y envía un comando final al **ESP32-CAM** (ej. "DESBLOQUEAR" o "DENEGADO").
7.  **Ejecución (Hardware):** El **ESP32-CAM** recibe el comando, muestra el mensaje correspondiente en la **pantalla OLED** y (si el acceso fue concedido) activa el **servomotor** para abrir la cerradura.

---

## 🛠️ Stack de Tecnologías

### Hardware
* **Microcontrolador:** ESP32-CAM (Captura de video y conectividad Wi-Fi).
* **Actuador:** Servomotor (Mecanismo de cerradura).
* **Pantalla:** Pantalla OLED (Feedback visual de estado).

### Aplicación Web (Backend Principal)
* **Framework:** Express.js (Node.js)
* **Base de Datos:** MongoDB Atlas (Almacenamiento de usuarios e intentos de acceso).
* **Funcionalidad:**
    * API interna para recibir peticiones del ESP32.
    * API para consumir el modelo de IA.
    * Sistema de login y gestión de usuarios.

### Servicio de IA (Backend Secundario)
* **Plataforma:** Google Colab (Hosting del modelo).
* **Framework:** Flask (Python) (Para crear la API REST).
* **IA / Visión Artificial:** OpenCV y Red Neuronal (Entrenada para reconocimiento facial).
* **Almacenamiento de Datos:** Google Drive (Para los datos de entrenamiento y acceso del modelo).

### Servicios Externos
* **Imgur:** Hosting de imágenes de usuario para el registro.

---

## ✨ Características Principales

* **Arquitectura de Microservicios:** Sistema desacoplado (Hardware, Web App, IA API) para mayor escalabilidad y mantenibilidad.
* **IA en la Nube:** Uso de Google Colab para ejecutar la red neuronal, permitiendo análisis potentes sin sobrecargar el microcontrolador.
* **Gestión de Usuarios:** Plataforma web completa con registro, login y base de datos en MongoDB Atlas.
* **Almacenamiento Eficiente:** Uso de Imgur para las imágenes de usuario, evitando la saturación del almacenamiento local de la app web.
* **Feedback Físico y Visual:** Respuesta instantánea al usuario mediante la pantalla OLED y el servomotor.

---

## 📂 Estructura del Repositorio

Este repositorio está organizado en tres ramas principales, cada una conteniendo un componente clave del sistema:

* **main (o master):** Contiene este archivo `README.md` y la documentación general.
* **app:** Contiene todo el código de la **aplicación web** (Express.js, Node.js, MongoDB).
* **embedded:** Contiene el firmware para el **ESP32-CAM** (código de Arduino).
* **nn_model:** Contiene el notebook de Google Colab con la **API de Flask** para el modelo de IA.

---

## 🔧 Instalación y Puesta en Marcha "Local"

### 1. Hardware (ESP32-CAM)
1.  Clona o descarga el código desde la rama **`embedded`** del repositorio.
2.  Abre el código `.ino` con el IDE de Arduino o PlatformIO.
3.  Instala las librerías necesarias (Ej. `Adafruit_SSD1306`, `ESP32Servo`, `ArduinoJson`).
4.  Configura tus credenciales de Wi-Fi y el endpoint de tu API Express:
    ```cpp
    const char* ssid = "TU_WIFI";
    const char* password = "TU_PASSWORD";
    const char* api_endpoint = "http://TU_APP_[EXPRESS.com/api/autenticar](https://EXPRESS.com/api/autenticar)";
    ```
5.  Sube el firmware al ESP32-CAM.

### 2. Backend (IA - Colab/Flask)
1.  Abre el notebook de Google Colab ubicado en la rama **`nn_model`** del repositorio.
2.  Monta tu Google Drive para que el script pueda acceder a los datos del modelo:
    ```python
    from google.colab import drive
    drive.mount('/content/drive')
    ```
3.  Instala las dependencias de Python:
    ```bash
    !pip install Flask flask-ngrok opencv-python ...
    ```
4.  Ejecuta el script de Flask. Se generará una URL pública (usualmente con `ngrok`) que deberás usar en el siguiente paso.

### 3. Backend (Web App - Express.js)
1.  Clona o descarga el código desde la rama **`app`** del repositorio.
2.  Crea un archivo `.env` en la raíz de esta carpeta con las siguientes variables:
    ```env
    # URL de tu base de datos en MongoDB Atlas
    MONGODB_URI="mongodb+srv://..."

    # Nombre de tu base de datos en MongoDB Atlas
    MONGO_DATABASE_NAME = "your database Name"
    
    # URL pública generada por Google Colab en el paso anterior
    COLAB_API_ENDPOINT="[http://XXXX.ngrok.io/reconocer](http://XXXX.ngrok.io/reconocer)"
    
    # Clave de API para subir imágenes a Imgur
    IMGUR_CLIENT_ID="TU_CLIENT_ID_IMGUR"
    
    # Puerto para la app web
    PORT=5000
    ```
3.  Instala las dependencias: `npm install`
4.  Ejecuta el servidor: `npm start`

---

## 📚 Recursos y Enlaces de Interés

* [Documentación oficial de Node.js](https://nodejs.org/)
* [Sitio web de Express.js](https://expressjs.com/)
* [Página de MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
* [Tutoriales de Google Colab](https://colab.research.google.com/)
* [Documentación de OpenCV](https://opencv.org/)
* [Universidad Tecnologica de Nayarit](https://utnay.edu.mx/)
* [GitHub: @CeicGitHub - Inda Ceniceros Cesar Eduardo](https://github.com/CeicGitHub)

---

## 👨‍💻 Autores (Equipo 3)

* **Bernal Loma Jose Angel** (Creador) - [GitHub: @Fernangel7](https://github.com/Fernangel7)
* **Castro Bañuelos Jocelyn Danae** (Colaborador) - [GitHub: @JunneBa](https://github.com/JunneBa)
* **Creano Rodriguez Donovan Joel** (Colaborador) - [GitHub: @Eryr-svg](https://github.com/Eryr-svg)
* **Duran Tapia Diego Alejandro** (Colaborador) - [GitHub: @tdalejandro01](https://github.com/tdalejandro01)
* **Godoy Romo Kevin Imanol** (Colaborador) - [GitHub: @kevingodoy0](https://github.com/kevingodoy0)

---

## 🎓 Agradecimientos y Contexto Académico

Este proyecto fue desarrollado en el contexto de la **Universidad Tecnológica de Nayarit**.

* **Carrera:** Ingenieria en Tecnologias de la Informacion e Innovacion Digital
* **Materia:** Sistemas Embebidos & Deep Learning
* **Grupo:** IA-41
* **Profesor:** Inda Ceniceros Cesar Eduardo

Un agradecimiento especial a nuestro profesor y a la universidad por su guía y apoyo durante el desarrollo de este proyecto.
