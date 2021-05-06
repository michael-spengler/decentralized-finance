# https://www.tensorflow.org/lite/convert#converting_a_keras_model_

# pip3 install -r requirements.txt or step by step - see below
# http://localhost
import cv2 # pip3 install opencv-python 
import numpy as np # pip3 install numpy
import streamlit as st # pip3 install streamlit
import tensorflow as tf # pip3 install tensorflow

import os

# Path
path = ""
path = os.path.join(path, "/Users/d050420/Desktop/FUN-APPS/defi/decentralized-finance/src/chart-analyzer/server", "my_model.h5")

# Join various path components 


from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input as mobilenet_v2_preprocess_input 

print(path)
print(os.path.isfile(path))
model = tf.keras.models.load_model(path)

uploaded_file = st.file_uploader("Choose File", type="png")
# uploaded_file = st.file_uploader("Choose File", type="jpg")

map_dict = {
    0: 'buy',
    1: 'sell'
}

if uploaded_file is not None:
    file_bytes = np.asarray(bytearray(uploaded_file.read()), dtype=np.uint8)
    opencv_image = cv2.imdecode(file_bytes, 1)
    # opencv_image = cv2.cvtColor(opencv_image, cv2.C)
    resized = cv2.resize(opencv_image, (224,224))

    st.image(opencv_image, channels="RGB")

    resized = mobilenet_v2_preprocess_input(resized)
    img_reshape = resized[np.newaxis,...]

    Generate_pred = st.button("Predict")
    if Generate_pred:
        prediction = model.predict(img_reshape).argmax()
        st.title("Prediction is {}".format(map_dict[prediction]))