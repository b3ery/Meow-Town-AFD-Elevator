# Meow-Town-AFD-Elevetor

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:1a0030,50:7a00b3,100:b100ff&height=200&section=header&text=🏢%20Meow%20Tower&fontSize=60&fontColor=fff&animation=fadeIn&fontAlignY=38&desc=Hotel%20Interativo%20%7C%20AFD%20%7C%20Linguagens%20Formais%20e%20Autômatos&descAlignY=62&descSize=14&descColor=e0b0ff"/>

</div>

<div align="center">

[![Typing SVG](https://readme-typing-svg.herokuapp.com/?color=b100ff&size=20&center=true&vCenter=true&width=900&lines=🏨+Um+hotel+pixel+art+com+AFD+do+elevador...;🎮+Autômato+Finito+Determinístico+em+ação!;🛎️+Escolha+o+andar.+Suba.+Explore!)](https://git.io/typing-svg)

</div>

<br>

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![AFD](https://img.shields.io/badge/AFD-Autômato%20Finito-7a00b3?style=flat-square&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web%20Audio-API%20Nativa-4a0070?style=flat-square&logoColor=white)

</div>

<br>

---

## 👥 Nossa Equipe

<div align="center">

<sub>Disciplina: <b>Linguagens Formais e Autômatos</b> — Universidade São Judas Tadeu · 2026</sub>

<br><br>

<table>
  <tr>
    <td align="center" width="14%">
      <a href="https://github.com/atr3ssa">
        <img src="https://avatars.githubusercontent.com/u/162994271?s=400&u=b6be7807d4f38c164926fbeb108a7e29ad502503&v=4" width="90px;" alt="Andressa"/><br>
        <sub><b>Andressa Rabêlo</b></sub>
      </a><br>
      <sub>RA: 823213904</sub>
    </td>
    <td align="center" width="14%">
      <a href="https://github.com/Julia-Olive">
        <img src="https://i.imgur.com/hrQ4GAz.jpeg" width="90px;" alt="Júlia"/><br>
        <sub><b>Júlia Oliveira</b></sub>
      </a><br>
      <sub>RA: 823214680</sub>
    </td>
    <td align="center" width="14%">
      <a href="https://github.com/Marzocca99">
        <img src="https://i.imgur.com/lYWliFF.jpeg" width="90px;" alt="Lucas"/><br>
        <sub><b>Lucas Marzocca</b></sub>
      </a><br>
      <sub>RA: 823116813</sub>
    </td>
    <td align="center" width="14%">
      <a href="https://github.com/Elmarquitoos">
        <img src="https://i.imgur.com/RcjtqUi.jpeg" width="90px;" alt="Marcos"/><br>
        <sub><b>Marcos V. Santos</b></sub>
      </a><br>
      <sub>RA: 82327399</sub>
    </td>
    <td align="center" width="14%">
      <a href="https://github.com/matheushfg">
        <img src="https://i.imgur.com/YBAtoF4.jpeg" width="90px;" alt="Matheus"/><br>
        <sub><b>Matheus H. F.</b></sub>
      </a><br>
      <sub>RA: 823141914</sub>
    </td>
    <td align="center" width="14%">
      <a href="https://github.com/b3ery">
        <img src="https://i.imgur.com/B7MrE2M.png" width="90px;" alt="Mylena"/><br>
        <sub><b>Mylena Soares</b></sub>
      </a><br>
      <sub>RA: 824144075</sub>
    </td>
  </tr>
</table>

</div>

<br>

---

## 🌃 Sobre o Projeto

> **Meow Tower** é uma animação interativa de um **hotel pixel art**, desenvolvida como trabalho prático da disciplina de **Linguagens Formais e Autômatos**. O sistema implementa um **Autômato Finito Determinístico (AFD)** completo para controlar o elevador do hotel — com estados, transições, alfabeto de entrada e estados de aceite — em uma interface web com estética **lo-fi noturna roxa**. Explore o lobby, o restaurante, a academia e os apartamentos! 🐱💜

<br>

<div align="center">

```
╔═══════════════════════════════════════════════════════════════════╗
║  🏢 Lobby/Terreo  →  🛎️ Entra no Elevador  →  🔢 Escolhe Andar  ║
║        ↓                                            ↓             ║
║  🚪 Sai no Andar  ←   📍 Chegou ao Destino  ←  🔄 Subindo/Desc  ║
╚═══════════════════════════════════════════════════════════════════╝
```

</div>

<br>

---

## 🧠 Fundamentação Teórica — O AFD

O sistema do elevador é modelado formalmente como:

$$M = (Q,\ \Sigma,\ \delta,\ q_0,\ F)$$

| Componente | Símbolo | Implementação no projeto |
|:---:|:---:|:---|
| **Estados** | $Q$ | `PARADO_TERREO`, `PORTAS_ABERTAS`, `PORTAS_FECHANDO`, `SUBINDO`, `DESCENDO`, `PASSANDO_1`, `PASSANDO_2`, `CHEGOU`, `FLOOR_1`, `FLOOR_2`, `FLOOR_3` |
| **Alfabeto** | $\Sigma$ | Botões T, 1, 2, 3 · Abrir porta · Fechar porta · Entrar · Chegada |
| **Transição** | $\delta$ | `δ(PARADO_TERREO, ENTRAR) → PORTAS_ABERTAS` · `δ(PORTAS_FECHANDO, SUBIR) → SUBINDO` |
| **Estado Inicial** | $q_0$ | `PARADO_TERREO` — elevador em repouso no térreo |
| **Estados Finais** | $F$ | `FLOOR_1`, `FLOOR_2`, `FLOOR_3` — elevador chegou ao andar destino |

<br>

### Tabela de Transições δ

<div align="center">

| Estado Atual | Evento | Próximo Estado |
|:---:|:---:|:---:|
| `PARADO_TERREO` | Entrar no elevador | `PORTAS_ABERTAS` |
| `PORTAS_ABERTAS` | Selecionar andar / Fechar | `PORTAS_FECHANDO` |
| `PORTAS_FECHANDO` | Destino acima | `SUBINDO` |
| `PORTAS_FECHANDO` | Destino abaixo | `DESCENDO` |
| `SUBINDO` | Passar pelo andar 1 | `PASSANDO_1` |
| `SUBINDO` | Passar pelo andar 2 | `PASSANDO_2` |
| `PASSANDO_1` | Continuar subindo | `PASSANDO_2` |
| `PASSANDO_2` | Continuar descendo | `PASSANDO_1` |
| `SUBINDO` / `DESCENDO` / `PASSANDO_*` | Chegou ao destino | `CHEGOU` |
| `CHEGOU` | Abrir portas | `PORTAS_ABERTAS` |
| `CHEGOU` | Entrar no andar 1 | `FLOOR_1` ✓ |
| `CHEGOU` | Entrar no andar 2 | `FLOOR_2` ✓ |
| `CHEGOU` | Entrar no andar 3 | `FLOOR_3` ✓ |
| `FLOOR_*` | Chamar elevador | `PARADO_TERREO` |

</div>

> Os estados `PASSANDO_1` e `PASSANDO_2` são registrados automaticamente durante o deslocamento, garantindo o rastreio completo das transições intermediárias no relatório AFD.

<br>

### 📊 Diagrama de Estados

```mermaid
stateDiagram-v2
    direction LR

    [*] --> PARADO_TERREO : início (q₀)

    PARADO_TERREO --> PORTAS_ABERTAS   : ENTRAR
    PORTAS_ABERTAS --> PORTAS_FECHANDO : FECHAR / SELECIONAR ANDAR
    PORTAS_FECHANDO --> SUBINDO        : MOVER ↑
    PORTAS_FECHANDO --> DESCENDO       : MOVER ↓

    SUBINDO  --> PASSANDO_1 : PASSAR F1
    SUBINDO  --> PASSANDO_2 : PASSAR F2
    DESCENDO --> PASSANDO_2 : PASSAR F2
    DESCENDO --> PASSANDO_1 : PASSAR F1

    PASSANDO_1 --> PASSANDO_2 : CONTINUA ↑
    PASSANDO_2 --> PASSANDO_1 : CONTINUA ↓

    SUBINDO    --> CHEGOU : CHEGOU
    DESCENDO   --> CHEGOU : CHEGOU
    PASSANDO_1 --> CHEGOU : CHEGOU
    PASSANDO_2 --> CHEGOU : CHEGOU

    CHEGOU --> PORTAS_ABERTAS : ABRIR
    CHEGOU --> FLOOR_1        : → F1
    CHEGOU --> FLOOR_2        : → F2
    CHEGOU --> FLOOR_3        : → F3

    FLOOR_1 --> PARADO_TERREO : → T
    FLOOR_2 --> PARADO_TERREO : → T
    FLOOR_3 --> PARADO_TERREO : → T

    FLOOR_1 --> [*] : Andar 1 ✓
    FLOOR_2 --> [*] : Andar 2 ✓
    FLOOR_3 --> [*] : Andar 3 ✓
```

<br>

---

## 🏨 Andares e Funcionalidades

<div align="center">

| Andar | Nome | O que explorar |
|:---:|:---:|:---|
| **T** | 🏢 Térreo / Lobby | Meow Candy (loja de doces), Stand de café, Recepção |
| **1** | 🍽️ Restaurante | Cardápio completo, Bar com drinks, Banheiro, Garçom animado |
| **2** | 💪 Academia | 9 equipamentos, Bebedouro, Vestiário, Piscina com ondas animadas, Terraço |
| **3** | 🛋️ Apartamentos | Corredor 301/302/303 · Apt 302 explorável: sacada, sala, cozinha, jantar, quarto, banheiro |

</div>

<br>

---

## ⚙️ Funcionalidades do Sistema

<div align="center">

| Feature | Descrição |
|:---:|:---|
| 🛗 **Elevador animado** | Tela de viagem com labels de andares se movendo, sacudida e sons de chegada |
| 📺 **HUD de estado** | Exibe o estado AFD atual do elevador em tempo real com transições |
| 🎮 **Personagens jogáveis** | Escolha entre 3 personagens (Helo, Pedro, Apollo) com sprites animados |
| 🚶 **Movimentação livre** | Ande pelos andares com ← → ou A/D, câmera segue o personagem |
| 🍬 **Stand de Café** | Pegue café, suco ou sanduíche e consuma clicando no personagem |
| 🍽️ **Garçom interativo** | Escolha do cardápio → garçom aparece na porta → vá buscar o pedido |
| 💪 **Academia completa** | Treine em cada equipamento, tome banho, use vestiário, nade na piscina |
| 🏠 **Apartamento 302** | Explore todos os cômodos: balancê na sacada, cozinhe, durma, tome banho |
| 🎵 **Sons sintéticos** | Web Audio API — sons de elevador, compra, interações e chegada de andar |
| 📋 **Relatório AFD** | Ao abrir o relatório, exibe o **diagrama completo** e a **timeline de transições** δ percorridas na sessão |

</div>

<br>

---

## 🚀 Como Executar

**💻 Local:**
```bash
git clone https://github.com/b3ery/MeowTower.git
cd MeowTower
# Abra o index.html no navegador
```

**Controles:**
```
← →  ou  A D    Mover personagem
   E            Interagir / Usar elevador
   W            Sair do elevador
  ESC           Fechar modais
```

> Sem dependências externas. HTML5 + CSS3 + JavaScript puro. ✨

<br>

---

<div align="center">

<br>

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:b100ff,50:7a00b3,100:1a0030&height=120&section=footer"/>

</div>
