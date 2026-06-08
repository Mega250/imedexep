# Documentacion Tecnica del Sistema iMedExp Backend

## Proposito

Esta carpeta documenta el backend de iMedExp, un sistema API para expediente clinico electronico. La documentacion esta escrita en espanol y usa diagramas UML en formato PlantUML para representar casos de uso, analisis, diseno, implementacion, base de datos y despliegue.

## Indice

1. [Guia del sistema y operacion](./01_guia_sistema.md)
2. [Modelo de casos de uso](./02_casos_uso.md)
3. [Modelo de analisis](./03_modelo_analisis.md)
4. [Modelo de diseno y diagramas de clases](./04_modelo_diseno.md)
5. [Modelo de implementacion](./05_modelo_implementacion.md)
6. [Modelo de base de datos y diagrama E-R](./06_modelo_base_datos.md)
7. [Modelo de despliegue](./07_modelo_despliegue.md)
8. [Seguridad, cumplimiento y operacion](./08_seguridad_cumplimiento.md)
9. [Ejemplos de implementacion frontend](./09_ejemplos_frontend.md)

## Como renderizar los diagramas UML

Los diagramas fuente estan en `docs/es/uml/*.puml`. Se pueden visualizar con PlantUML, VS Code con la extension PlantUML, IntelliJ, GitLab con PlantUML habilitado, MkDocs con plugin PlantUML o con Docker.

Para exportarlos a SVG con PlantUML instalado:

```bash
plantuml -tsvg docs/es/uml/*.puml
```

Para exportarlos con Docker:

```bash
docker run --rm -v "$PWD:/workspace" -w /workspace plantuml/plantuml -tsvg docs/es/uml/*.puml
```

En Windows PowerShell:

```powershell
.\scripts\windows\render_puml.ps1
```

Para generar el PDF imprimible con figuras:

```bash
bash scripts/linux/build_docs_pdf.sh
```

En Windows PowerShell:

```powershell
.\scripts\windows\build_docs_pdf.ps1
```

Para generar documentacion HTML o PDF formal, se recomienda MkDocs Material con un plugin PlantUML:

```bash
pip install mkdocs-material mkdocs-build-plantuml-plugin
mkdocs new site-docs
```

Despues se copian estos archivos a `site-docs/docs/` y se configura el plugin para procesar los `.puml`.

## Inventario de diagramas UML

| Archivo | Tipo UML | Documento que lo explica |
| --- | --- | --- |
| `uml/01_casos_uso.puml` | Casos de uso | `02_casos_uso.md` |
| `uml/02_analisis_dominio.puml` | Clases de analisis con boundary/control/entity | `03_modelo_analisis.md` |
| `uml/03_analisis_consulta_sequence.puml` | Secuencia | `03_modelo_analisis.md` |
| `uml/04_analisis_menstrual_sequence.puml` | Secuencia | `03_modelo_analisis.md` |
| `uml/05_diseno_clases_core.puml` | Clases | `04_modelo_diseno.md` |
| `uml/06_diseno_clases_clinico.puml` | Clases | `04_modelo_diseno.md` |
| `uml/07_implementacion_componentes.puml` | Componentes | `05_modelo_implementacion.md` |
| `uml/08_implementacion_paquetes.puml` | Paquetes | `05_modelo_implementacion.md` |
| `uml/09_base_datos_er.puml` | E-R con notacion UML/PlantUML | `06_modelo_base_datos.md` |
| `uml/10_despliegue.puml` | Despliegue | `07_modelo_despliegue.md` |
| `uml/11_seguridad_secuencia.puml` | Secuencia | `08_seguridad_cumplimiento.md` |

## Alcance

Esta documentacion cubre:

- API FastAPI.
- Capa de autenticacion y autorizacion.
- Capa de servicios y repositorios.
- Modelos clinicos y administrativos.
- Seguridad aplicada en backend.
- Infraestructura Kubernetes/Terraform agregada al repositorio.
- Modelo de datos PostgreSQL con RLS, auditoria y cifrado a nivel aplicacion.
- Ejemplos de consumo desde frontend con TypeScript y React.

No sustituye documentos legales, politicas internas, aviso de privacidad, contratos de tratamiento de datos, matriz de riesgos formal ni certificacion normativa.
