export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ZodError") {
    return res.status(400).json({
      errors: err.errors
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  if (err.code === "P2002") {
    const field = err.meta?.target?.[0];

    return res.status(409).json({
      message: `${field} ya está en uso`
    });
  }
  res.status(500).json({
    message: "Error interno del servidor"
  });
};
/* este solo es para los errores del catch asi que enves de poner

catch (error) {
    res.status(400).json({ error: error.errors ?? "ID inválido" });
  } dependiendo de cadanuno 
   solo ponemos 

   catch (error) {
    next(error); 
  }
};*/