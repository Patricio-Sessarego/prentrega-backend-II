import mongoose from 'mongoose'

mongoose.connect("mongodb+srv://Patricio-Sessarego:Patricio2005@clustercoderhouse.jdm36.mongodb.net/BackendII?retryWrites=true&w=majority&appName=ClusterCoderHouse")
    .then(() => console.log("BASE DE DATOS CONECTADA"))
    .catch((error) => console.error(error))