"""Simple rule-based chatbot demo for class use."""


def normalize(text: str) -> str:
    return " ".join(text.lower().strip().split())


RESPONSES = [
    ("what is a chatbot", "Un chatbot es software disenado para simular conversacion humana a traves de texto o voz."),
    ("que es un chatbot", "Un chatbot es software disenado para simular conversacion humana a traves de texto o voz."),
    ("chatbot definition", "Un chatbot es una aplicacion que responde a los usuarios de manera conversacional."),
    ("history", "Los chatbots evolucionaron de programas basados en reglas como ELIZA hasta los modernos modelos de IA basados en transformadores."),
    ("historia", "Los chatbots evolucionaron de programas basados en reglas como ELIZA hasta los modernos modelos de IA basados en transformadores."),
    ("turing", "Alan Turing propuso la Prueba de Turing en 1950 para preguntar si una maquina puede actuar de manera indistinguible de un humano."),
    ("markov", "Andrey Markov introdujo las Cadenas de Markov en 1906, ayudando a formar primeras ideas para el modelado de secuencias de lenguaje."),
    ("eliza", "ELIZA fue creado por Joseph Weizenbaum en el MIT y se hizo famoso en 1966."),
    ("who created eliza", "ELIZA fue creado por Joseph Weizenbaum en 1966."),
    ("quien creo eliza", "ELIZA fue creado por Joseph Weizenbaum en 1966."),
    ("parry", "PARRY fue creado por Kenneth Colby en 1972 para simular a un paciente paranoico."),
    ("alice", "A.L.I.C.E. fue creado por Richard Wallace y uso reglas AIML para gestionar conversaciones."),
    ("aiml", "AIML es un formato de reglas usado por A.L.I.C.E. para encontrar patrones y generar respuestas."),
    ("transformer", "La arquitectura Transformer, introducida en 2017, hizo que los chatbots modernos fueran mucho mas poderosos y eficientes."),
    ("self attention", "La auto-atencion permite que un modelo se enfoque en diferentes partes de la entrada para entender el contexto."),
    ("autoatencion", "La auto-atencion permite que un modelo se enfoque en diferentes partes de la entrada para entender el contexto."),
    ("nlp", "El procesamiento de lenguaje natural ayuda a las computadoras a entender y generar lenguaje humano."),
    ("nlu", "NLU, o entendimiento de lenguaje natural, ayuda a un chatbot a detectar la intencion del usuario y extraer detalles clave."),
    ("retrieval", "La generacion aumentada por recuperacion mejora la precision al obtener informacion externa relevante antes de responder."),
    ("recuperacion", "La generacion aumentada por recuperacion mejora la precision al obtener informacion externa relevante antes de responder."),
    ("applications", "Los chatbots se usan en servicio al cliente, educacion, salud y comercio electronico."),
    ("aplicaciones", "Los chatbots se usan en servicio al cliente, educacion, salud y comercio electronico."),
    ("chatgpt", "ChatGPT es un chatbot moderno construido sobre tecnologia de modelos de lenguaje grandes."),
    ("siri", "Siri es un asistente de voz lanzado en 2011 como parte del movimiento hacia asistentes de IA practicos."),
    ("google now", "Google Now aparecio en 2012 como un asistente temprano que combinaba voz y reglas."),
    ("cortana", "Cortana se lanzo en 2014 como otro ejemplo de asistente virtual."),
    ("limitations", "Las limitaciones comunes de los chatbots incluyen alucinaciones, latencia y ventanas de contexto limitadas."),
    ("limitaciones", "Las limitaciones comunes de los chatbots incluyen alucinaciones, latencia y ventanas de contexto limitadas."),
]


def get_response(user_input: str) -> str:
    text = normalize(user_input)

    if text in {"hi", "hello", "hey", "hola"}:
        return "Hola! Preguntame sobre historia de chatbots, tecnologia o figuras clave."
    if text in {"bye", "goodbye", "exit", "quit", "adios"}:
        return "Adios!"

    for key, response in RESPONSES:
        if key in text:
            return response

    if "who" in text and "created" in text and "eliza" in text:
        return "ELIZA fue creado por Joseph Weizenbaum en 1966."
    if "what" in text and "chatbot" in text:
        return "Un chatbot es software diseñado para simular conversacion humana a traves de texto o voz."

    return "No conozco eso aun. Intenta preguntar sobre ELIZA, Turing, transformadores, AIML o usos de chatbots."


def main() -> None:
    print("Chatbot Demo\nEscribe 'bye' para salir.\n")
    while True:
        try:
            user_input = input("Tu: ")
        except (EOFError, KeyboardInterrupt):
            print("\nBot: Adios!")
            break

        reply = get_response(user_input)
        print(f"Bot: {reply}")
        if normalize(user_input) in {"bye", "goodbye", "exit", "quit", "adios"}:
            break


if __name__ == "__main__":
    main()