import pandas as pd
import json

def convert(xlsx_file, json_file):
    df = pd.read_excel(xlsx_file)
    df.to_json(json_file, orient="records", force_ascii=False, indent=2)

# CONVERTA AQUI SUAS BASES
convert("catalogo_nao_mostrar_indice.xlsx", "nao_mostrar_indice.json")

print("Conversão concluída!")