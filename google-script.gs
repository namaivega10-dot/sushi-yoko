function doPost(e) {
  try {
    // 1. Conectar con la hoja de cálculo activa
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 2. Leer los datos enviados por nuestro fetch (que vienen en JSON)
    var data = JSON.parse(e.postData.contents);
    
    // 3. Crear la fila con los datos (Añadimos la fecha actual al inicio)
    var rowData = [
      new Date(),              // Columna A: Fecha/Hora del Pedido
      data.nombre,             // Columna B: Nombre del Cliente
      data.direccion,          // Columna C: Dirección de Envío
      data.pedidoDetallado,    // Columna D: Pedido Detallado
      data.totalAcumulado,     // Columna E: Total Acumulado (MXN)
      data.notas,              // Columna F: Notas Adicionales
      "Nuevo"                  // Columna G: Estado del Pedido (valor por defecto)
    ];
    
    // 4. Agregar la fila a la hoja
    sheet.appendRow(rowData);
    
    // 5. Devolver una respuesta de éxito al navegador
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Datos guardados" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    // En caso de error, devolver un mensaje
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Esta función es necesaria a veces para que Google permita la conexión CORS inicial
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
}
