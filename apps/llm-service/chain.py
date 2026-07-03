import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from dotenv import load_dotenv

from schema import RouteConfig

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
    api_key=os.getenv("GROQ_API_KEY")
)

parser = PydanticOutputParser(pydantic_object=RouteConfig)

prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an API schema generator. Given a plain English description,
    return ONLY valid JSON matching this schema. No prose, no markdown, no explanation.
    IMPORTANT: For dynamic path parameters, you MUST use Express-style syntax (e.g. /users/:id). DO NOT use curly braces (e.g. /users/{{id}}).
    {format_instructions}"""),
    ("human", "{description}")
])

prompt = prompt.partial(format_instructions=parser.get_format_instructions())

chain = prompt | llm | parser
