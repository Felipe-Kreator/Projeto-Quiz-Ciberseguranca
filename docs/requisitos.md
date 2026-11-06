# Requisitos do CyberQuiz

## 1. Requisitos funcionais

| Código | Requisito | Descrição | Prioridade inicial |
|---|---|---|---|
| RF01 | Iniciar quiz | Permitir iniciar uma partida. | Alta |
| RF02 | Exibir perguntas | Apresentar enunciados e alternativas. | Alta |
| RF03 | Selecionar resposta | Permitir escolher uma alternativa. | Alta |
| RF04 | Validar resposta | Verificar a resposta enviada. | Alta |
| RF05 | Calcular pontuação | Contabilizar o desempenho da partida. | Alta |
| RF06 | Exibir resultado | Mostrar o resultado ao final. | Alta |
| RF07 | Registrar resultado | Persistir os resultados no banco. | Alta |
| RF08 | Exibir ranking | Apresentar resultados classificados. | Média |
| RF09 | Categorizar perguntas | Organizar perguntas por tema. | Média |
| RF10 | Consultar ranking | Permitir consultar a classificação registrada. | Média |

## 2. Requisitos não funcionais

| Código | Requisito | Descrição |
|---|---|---|
| RNF01 | Usabilidade | A interface deve ser simples e compreensível. |
| RNF02 | Responsividade | A aplicação deve se adaptar a diferentes telas. |
| RNF03 | Segurança | Entradas devem ser validadas no backend. |
| RNF04 | Desempenho | Operações comuns devem ocorrer sem atrasos perceptíveis. |
| RNF05 | Manutenibilidade | O código deve ser organizado por responsabilidades. |
| RNF06 | Compatibilidade | A aplicação deve funcionar em navegadores modernos. |
| RNF07 | Integridade | Os dados persistidos devem manter consistência. |
| RNF08 | Confiabilidade | A pontuação deve ser calculada de forma consistente no backend. |

## 3. Regras de negócio a definir

Antes da implementação, a equipe deverá decidir:

- Quantas perguntas terá cada partida.
- Se as perguntas serão aleatórias.
- Como a pontuação será calculada.
- Se haverá limite de tempo.
- Como serão tratados empates no ranking.
- Se o participante informará nome, apelido ou terá uma conta.
- Se será possível repetir uma partida.
- Se haverá categorias e níveis de dificuldade.

Essas regras ainda não estão fixadas nesta versão da documentação.
