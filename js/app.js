$(document).ready(function () {
  cardapio.eventos.init();
  

});

var cardapio = {}; //Cardapio orientado a objeto

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 4.0;

var CELULAR_EMPRESA = "92992674576";

//Cardapio orientado a objeto
cardapio.eventos = {
  init: () => {
    cardapio.metodos.obterItensCardapio();
    cardapio.metodos.carregarBotaoLigar();
    cardapio.metodos.carregarBotaoReserva();
    cardapio.metodos.obterDados();
  },
};



cardapio.metodos = {
  // obtem a lista de itens do cardápio
  obterItensCardapio: (categoria = "doces", vermais = false) => {
    var filtro = MENU[categoria];
    console.log(filtro);

    if (!vermais) {
      $("#itensCardapio").html("");
      $("#btnVerMais").removeClass("hidden");
      $("#btnVerMenos").addClass("hidden");
    }

    $.each(filtro, (i, e) => {
      let temp = cardapio.templates.item
        .replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${id}/g, e.id);

      // botão ver mais foi clicado (12 itens)
      if (vermais && i >= 8 && i < 14) {
        $("#itensCardapio").append(temp);
      }

      // paginação inicial (8 itens)
      if (!vermais && i < 8) {
        $("#itensCardapio").append(temp);
      }
    });

    // remove o ativo
    $(".container-menu a").removeClass("active");

    // seta o menu para ativo
    $("#menu-" + categoria).addClass("active");
  },

  obterDados: () => {
    const tabelaPedidos = $("#tabela-pedidos");
    tabelaPedidos.empty();
    const pedidosRef = db.collection("pedidos");

    pedidosRef
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const pedido = doc.data();
          // Criar uma nova linha na tabela para cada pedido
          const tr = $("<tr>");

          tr.html(`
                <td>${doc.id}</td>
                <td>${pedido.itens.map((item) => `${item.nome} x${item.quantidade}`).join("<br>")}</td>
                <td>${pedido.endereco.endereco}, ${pedido.endereco.numero}<br>${pedido.endereco.bairro}<br>${pedido.endereco.cidade} - ${pedido.endereco.uf}<br>CEP: ${pedido.endereco.cep}<br>Complemento: ${pedido.endereco.complemento}<br>Nome: ${pedido.endereco.fullName}</td>
                <td>${pedido.total}</td>
                <td><button class="btn btn-primary editar-pedido" data-id="${doc.id}" onclick="cardapio.metodos.editarPedido('${doc.id}')">Editar</button>

                <button class="btn btn-danger excluir-pedido" data-id="${doc.id}" onclick="cardapio.metodos.excluirPedido('${doc.id}')">
                Cancelar</button></td>`);

          // Adicionar a linha à tabela
          tabelaPedidos.append(tr);
        });
      })
      .catch((error) => {
        console.error("Erro ao listar pedidos:", error);
        // Tratar o erro de alguma forma apropriada
      });
  },

  // clique no botão de ver mais
  // clique no botão de ver mais
  verMais: () => {
    var ativo = $(".container-menu a.active").attr("id").split("menu-")[1];

    // Chama a função obterItensCardapio com vermais definido como verdadeiro para mostrar mais itens
    cardapio.metodos.obterItensCardapio(ativo, true);

    // Adiciona a classe 'hidden' ao botão de ver mais
    $("#btnVerMais").addClass("hidden");

    // Remove a classe 'hidden' do botão de ver menos
    $("#btnVerMenos").removeClass("hidden");
  },

  // clique no botão de ver menos
  verMenos: () => {
    var ativo = $(".container-menu a.active").attr("id").split("menu-")[1];

    // Chama a função obterItensCardapio com vermais definido como falso para mostrar apenas os primeiros 8 itens
    cardapio.metodos.obterItensCardapio(ativo, false);

    // Adiciona a classe 'hidden' ao botão de ver menos
    $("#btnVerMenos").addClass("hidden");

    // Remove a classe 'hidden' do botão de ver mais
    $("#btnVerMais").removeClass("hidden");
  },
  // diminuir a quantidade do item no cardapio
  diminuirQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      $("#qntd-" + id).text(qntdAtual - 1);
    }
  },

  // aumentar a quantidade do item no cardapio
  aumentarQuantidade: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());
    $("#qntd-" + id).text(qntdAtual + 1);
  },

  // adicionar ao carrinho o item do cardápio
  adicionarAoCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-" + id).text());

    if (qntdAtual > 0) {
      // obter a categoria ativa
      var categoria = $(".container-menu a.active")
        .attr("id")
        .split("menu-")[1];

      // obtem a lista de itens
      let filtro = MENU[categoria];

      // obtem o item
      let item = $.grep(filtro, (e, i) => {
        return e.id == id;
      });

      if (item.length > 0) {
        // validar se já existe esse item no carrinho
        let existe = $.grep(MEU_CARRINHO, (elem, index) => {
          return elem.id == id;
        });

        // caso já exista o item no carrinho, só altera a quantidade
        if (existe.length > 0) {
          let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id); //Procura a possicao
          MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
        }
        // caso ainda não exista o item no carrinho, adiciona ele
        else {
          item[0].qntd = qntdAtual;
          MEU_CARRINHO.push(item[0]);
        }

        cardapio.metodos.mensagem("Item adicionado ao carrinho", "green");
        $("#qntd-" + id).text(0);

        cardapio.metodos.atualizarBadgeTotal();
      }
    }
  },

  // atualiza o badge de totais dos botões "Meu carrinho"
  atualizarBadgeTotal: () => {
    var total = 0;

    $.each(MEU_CARRINHO, (i, e) => {
      total += e.qntd;
    });

    if (total > 0) {
      $(".botao-carrinho").removeClass("hidden");
      $(".container-total-carrinho").removeClass("hidden");
    } else {
      $(".botao-carrinho").addClass("hidden");
      $(".container-total-carrinho").addClass("hidden");
    }

    $(".badge-total-carrinho").html(total);
  },

  // abrir a modal de carrinho
  abrirCarrinho: (abrir) => {
    if (abrir) {
      $("#modalCarrinho").removeClass("hidden");
      cardapio.metodos.carregarCarrinho();
    } else {
      $("#modalCarrinho").addClass("hidden");
    }
  },

  // altera os texto e exibe os botões das etapas
  carregarEtapa: (etapa) => {
    if (etapa == 1) {
      $("#lblTituloEtapa").text("Seu carrinho:");
      $("#itensCarrinho").removeClass("hidden");
      $("#localEntrega").addClass("hidden");
      $("#resumoCarrinho").addClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");

      $("#btnEtapaPedido").removeClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").addClass("hidden");
    }

    if (etapa == 2) {
      $("#lblTituloEtapa").text("Endereço de entrega:");
      $("#itensCarrinho").addClass("hidden");
      $("#localEntrega").removeClass("hidden");
      $("#resumoCarrinho").addClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").removeClass("hidden");
      $("#btnEtapaResumo").addClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }

    if (etapa == 3) {
      $("#lblTituloEtapa").text("Resumo do pedido:");
      $("#itensCarrinho").addClass("hidden");
      $("#localEntrega").addClass("hidden");
      $("#resumoCarrinho").removeClass("hidden");

      $(".etapa").removeClass("active");
      $(".etapa1").addClass("active");
      $(".etapa2").addClass("active");
      $(".etapa3").addClass("active");

      $("#btnEtapaPedido").addClass("hidden");
      $("#btnEtapaEndereco").addClass("hidden");
      $("#btnEtapaResumo").removeClass("hidden");
      $("#btnVoltar").removeClass("hidden");
    }
  },

  // botão de voltar etapa
  voltarEtapa: () => {
    let etapa = $(".etapa.active").length;
    cardapio.metodos.carregarEtapa(etapa - 1);
  },

  // carrega a lista de itens do carrinho
  carregarCarrinho: () => {
    cardapio.metodos.carregarEtapa(1);

    if (MEU_CARRINHO.length > 0) {
      $("#itensCarrinho").html("");

      $.each(MEU_CARRINHO, (i, e) => {
        let temp = cardapio.templates.itemCarrinho
          .replace(/\${img}/g, e.img)
          .replace(/\${nome}/g, e.name)
          .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
          .replace(/\${id}/g, e.id)
          .replace(/\${qntd}/g, e.qntd);

        $("#itensCarrinho").append(temp);

        // último item
        if (i + 1 == MEU_CARRINHO.length) {
          cardapio.metodos.carregarValores();
        }
      });
    } else {
      $("#itensCarrinho").html(
        '<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>'
      );
      cardapio.metodos.carregarValores();
    }
  },

  // diminuir quantidade do item no carrinho
  diminuirQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());

    if (qntdAtual > 1) {
      $("#qntd-carrinho-" + id).text(qntdAtual - 1);
      cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
    } else {
      cardapio.metodos.removerItemCarrinho(id);
    }
  },

  // aumentar quantidade do item no carrinho
  aumentarQuantidadeCarrinho: (id) => {
    let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
    $("#qntd-carrinho-" + id).text(qntdAtual + 1);
    cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);
  },

  // botão remover item do carrinho
  removerItemCarrinho: (id) => {
    MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {
      return e.id != id;
    });
    cardapio.metodos.carregarCarrinho();

    // atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();
  },

  // atualiza o carrinho com a quantidade atual
  atualizarCarrinho: (id, qntd) => {
    let objIndex = MEU_CARRINHO.findIndex((obj) => obj.id == id);
    MEU_CARRINHO[objIndex].qntd = qntd;

    // atualiza o botão carrinho com a quantidade atualizada
    cardapio.metodos.atualizarBadgeTotal();

    // atualiza os valores (R$) totais do carrinho
    cardapio.metodos.carregarValores();
  },

  // carrega os valores de SubTotal, Entrega e Total
  carregarValores: () => {
    VALOR_CARRINHO = 0;

    $("#lblSubTotal").text("R$ 0,00");
    $("#lblValorEntrega").text("+ R$ 0,00");
    $("#lblValorTotal").text("R$ 0,00");

    $.each(MEU_CARRINHO, (i, e) => {
      VALOR_CARRINHO += parseFloat(e.price * e.qntd);

      if (i + 1 == MEU_CARRINHO.length) {
        $("#lblSubTotal").text(
          `R$ ${VALOR_CARRINHO.toFixed(2).replace(".", ",")}`
        );
        $("#lblValorEntrega").text(
          `+ R$ ${VALOR_ENTREGA.toFixed(2).replace(".", ",")}`
        );
        $("#lblValorTotal").text(
          `R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace(".", ",")}`
        );
      }
    });
  },

  // carregar a etapa enderecos
  carregarEndereco: () => {
    if (MEU_CARRINHO.length <= 0) {
      cardapio.metodos.mensagem("Seu carrinho está vazio.");
      return;
    }

    cardapio.metodos.carregarEtapa(2);
  },

  // API ViaCEP
  buscarCep: () => {
    // cria a variavel com o valor do cep
    var cep = $("#txtCEP").val().trim().replace(/\D/g, "");

    // verifica se o CEP possui valor informado
    if (cep != "") {
      // Expressão regular para validar o CEP
      var validacep = /^[0-9]{8}$/;

      if (validacep.test(cep)) {
        $.getJSON(
          "https://viacep.com.br/ws/" + cep + "/json/?callback=?",
          function (dados) {
            if (!("erro" in dados)) {
              // Atualizar os campos com os valores retornados
              $("#txtEndereco").val(dados.logradouro);
              $("#txtBairro").val(dados.bairro);
              $("#txtCidade").val(dados.localidade);
              $("#ddlUf").val(dados.uf);
              $("#txtNumero").focus();
            } else {
              cardapio.metodos.mensagem(
                "CEP não encontrado. Preencha as informações manualmente."
              );
              $("#txtEndereco").focus();
            }
          }
        );
      } else {
        cardapio.metodos.mensagem("Formato do CEP inválido.");
        $("#txtCEP").focus();
      }
    } else {
      cardapio.metodos.mensagem("Informe o CEP, por favor.");
      $("#txtCEP").focus();
    }
  },

  // validação antes de prosseguir para a etapa 3
  resumoPedido: () => {
    let cep = $("#txtCEP").val().trim();
    let endereco = $("#txtEndereco").val().trim();
    let bairro = $("#txtBairro").val().trim();
    let cidade = $("#txtCidade").val().trim();
    let uf = $("#ddlUf").val().trim();
    let numero = $("#txtNumero").val().trim();
    let complemento = $("#txtComplemento").val().trim();
    let fullName = $("#txtName").val().trim();
    //let idImg = $("").val().trim();

    if (cep.length <= 0) {
      cardapio.metodos.mensagem("Informe o CEP, por favor.");
      $("#txtCEP").focus();
      return;
    }

    if (endereco.length <= 0) {
      cardapio.metodos.mensagem("Informe o Endereço, por favor.");
      $("#txtEndereco").focus();
      return;
    }

    if (bairro.length <= 0) {
      cardapio.metodos.mensagem("Informe o Bairro, por favor.");
      $("#txtBairro").focus();
      return;
    }

    if (cidade.length <= 0) {
      cardapio.metodos.mensagem("Informe a Cidade, por favor.");
      $("#txtCidade").focus();
      return;
    }

    if (uf == "-1") {
      cardapio.metodos.mensagem("Informe a UF, por favor.");
      $("#ddlUf").focus();
      return;
    }

    if (numero.length <= 0) {
      cardapio.metodos.mensagem("Informe o Número, por favor.");
      $("#txtNumero").focus();
      return;
    }

    if (fullName.length <= 0) {
      cardapio.metodos.mensagem("Informe o seu nome completo, por favor.");
      $("#txtName").focus();
      return;
    }
    
    MEU_ENDERECO = {
      cep: cep,
      endereco: endereco,
      bairro: bairro,
      cidade: cidade,
      uf: uf,
      numero: numero,
      complemento: complemento,
      fullName: fullName,
    };

    cardapio.metodos.carregarEtapa(3);
    cardapio.metodos.carregarResumo();
  },

  limparCarrinho: () => {
    MEU_CARRINHO = [];
    cardapio.metodos.atualizarBadgeTotal();
    cardapio.metodos.carregarCarrinho();
  },

  // carrega a etapa de Resumo do pedido
  carregarResumo: () => {
    $("#listaItensResumo").html("");

    $.each(MEU_CARRINHO, (i, e) => {
      let temp = cardapio.templates.itemResumo
        .replace(/\${img}/g, e.img)
        .replace(/\${nome}/g, e.name)
        .replace(/\${preco}/g, e.price.toFixed(2).replace(".", ","))
        .replace(/\${qntd}/g, e.qntd);

      $("#listaItensResumo").append(temp);
    });

    $("#resumoEndereco").html(
      `${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`
    );
    $("#cidadeEndereco").html(
      `${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}, ${MEU_ENDERECO.fullName}`
    );

    cardapio.metodos.finalizarPedido();
  },
  // Atualiza o link do botão do WhatsApp
  finalizarPedido: () => {
    if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
      var texto = "Olá! gostaria de fazer um pedido:";
      texto += `\n*Itens do pedido:*\n\n\${itens}`;
      texto += "\n*Endereço de entrega:*";
      texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`;
      texto += `\n${MEU_ENDERECO.cidade}-${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;
      texto += `\nNome do cliente: ${MEU_ENDERECO.fullName}`;
      texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA)
        .toFixed(2)
        .replace(".", ",")}*`;

      var itens = "";

      $.each(MEU_CARRINHO, (i, e) => {
        itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price
          .toFixed(2)
          .replace(".", ",")} \n`;

        // último item
        if (i + 1 == MEU_CARRINHO.length) {
          texto = texto.replace(/\${itens}/g, itens);

          // converte a URL
          let encode = encodeURI(texto);
          let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

          $("#btnEtapaResumo").attr("href", URL);
        }

        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
          // ... (código existente)

          $("#btnEtapaResumo").on("click", () => {
            cardapio.metodos.adicionarPedido();
            // limpa o carrinho após clicar no botão de Resumo
            cardapio.metodos.limparCarrinho();
          });
        }
      });
    }
  },

  // Função para adicionar pedido ao Firestore
  adicionarPedido: () => {
    if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {
      // Crie um objeto com os dados do pedido e endereço
      const pedidoData = {
        itens: MEU_CARRINHO.map((item) => ({
          //A propriedade itens é um array que contém objetos JSON com os detalhes de cada item no carrinho
          nome: item.name,
          preco: item.price,
          quantidade: item.qntd,
        })),
        endereco: {
          //é um objeto JSON que armazena os dados do endereço de entrega
          endereco: MEU_ENDERECO.endereco,
          numero: MEU_ENDERECO.numero,
          bairro: MEU_ENDERECO.bairro,
          cidade: MEU_ENDERECO.cidade,
          uf: MEU_ENDERECO.uf,
          cep: MEU_ENDERECO.cep,
          complemento: MEU_ENDERECO.complemento,
          fullName: MEU_ENDERECO.fullName,
        },
        total: (VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2),
      };

      // Converter objeto para uma string JSON
      const pedidoJSON = JSON.stringify(pedidoData);

      // Enviar a string JSON para o Firebase
      db.collection("pedidos")
        .add(JSON.parse(pedidoJSON))
        .then((docRef) => {
          console.log("Pedido adicionado com sucesso:", docRef.id);
          alert("Pedido adicionado com sucesso.");
          // cardapio.metodos.listarPedido(); // Se necessário
        })
        .catch((error) => {
          console.error("Erro ao adicionar pedido:", error);
          alert("Erro ao adicionar pedido.");
        });
    }
  },

  editarPedido: (pedidoId) => {
    let hiddenTable = $("#table");
    let hiddenUpgrade = $("#updateDados");
    hiddenTable.addClass("hidden");
    hiddenUpgrade.removeClass("hidden");

    const pedidosRef = db.collection("pedidos");

    pedidosRef
      .doc(pedidoId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const dadosPedido = doc.data().endereco;

          // Preencha os campos do formulário com os dados recuperados do banco de dados
          $("#txtCEP").val(dadosPedido.cep || "");
          $("#txtEndereco").val(dadosPedido.endereco || "");
          $("#txtBairro").val(dadosPedido.bairro || "");
          $("#txtNumero").val(dadosPedido.numero || "");
          $("#txtCidade").val(dadosPedido.cidade || "");
          $("#txtComplemento").val(dadosPedido.complemento || "");
          $("#ddlUf").val(dadosPedido.uf || "-1");
          $("#txtName").val(dadosPedido.fullName || "");

          // Adicione um evento de clique ao botão de atualizar
          $("#btnAtualizar").on("click", function (event) {
            event.preventDefault();
            cardapio.metodos.atualizarPedido(pedidoId);
          });
        } else {
          console.log("Nenhum documento encontrado");
        }
      })
      .catch((error) => {
        console.error("Erro ao obter pedidos:", error);
      });
  },

  atualizarPedido: (pedidoId) => {
    try {
      const pedidosRef = db.collection("pedidos");

      // Obtenha os valores dos campos do formulário
      const cep = $("#txtCEP").val();
      const endereco = $("#txtEndereco").val();
      const bairro = $("#txtBairro").val();
      const numero = $("#txtNumero").val();
      const cidade = $("#txtCidade").val();
      const complemento = $("#txtComplemento").val();
      const uf = $("#ddlUf").val();
      const nomeCliente = $("#txtName").val();

      // Atualize os dados do pedido no Firestore
      pedidosRef
        .doc(pedidoId)
        .update({
          "endereco.cep": cep,
          "endereco.endereco": endereco,
          "endereco.bairro": bairro,
          "endereco.numero": numero,
          "endereco.cidade": cidade,
          "endereco.complemento": complemento,
          "endereco.uf": uf,
          "endereco.fullName": nomeCliente,
        })
        .then(() => {
          alert("Pedido atualizado com sucesso!");
          location.reload();
          // Você pode adicionar lógica adicional aqui, se necessário
        })
        .catch((error) => {
          console.error("Erro ao atualizar o pedido:", error);
          alert("Erro ao atualizar o pedido. Tente novamente.");
        });
    } catch (error) {
      console.error("Erro ao processar o formulário:", error);
      // Trate o erro de alguma forma apropriada
    }
  },

  excluirPedido: (pedidoId) => {
    if (confirm("Tem certeza que deseja cancelar este pedido?")) {
      const pedidosRef = db.collection("pedidos");
      pedidosRef
        .doc(pedidoId)
        .delete()
        .then(() => {
          alert("Pedido Cancelado!");
          // Remover a linha da tabela após excluir o pedido (se necessário)
          const row = $(`#${pedidoId}`);
          if (row.length > 0) {
            row.remove();
          }
          location.reload();
        })
        .catch((error) => {
          console.error("Erro ao excluir o pedido:", error);
          alert("Erro ao excluir o pedido. Tente novamente.");
        });
    }
  },

  // carrega o link do botão reserva
  carregarBotaoReserva: () => {
    var texto = "Olá! gostaria de fazer uma *reserva*";

    let encode = encodeURI(texto);
    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

    $("#btnReserva").attr("href", URL);
  },

  // carrega o botão de ligar
  carregarBotaoLigar: () => {
    $("#btnLigar").attr("href", `tel:${CELULAR_EMPRESA}`);
  },

  listarDepoimentos: () => {
    // Recuperar os depoimentos do Firestore
    db.collection("depoimentos")
      .get()
      .then((querySnapshot) => {
        // Limpar qualquer depoimento existente na página
        $(".depoimento").addClass("hidden");

        // Iterar sobre os documentos de depoimento
        querySnapshot.forEach((doc, index) => {
          const depoimentoData = doc.data();

          // Atualizar os elementos HTML com os dados do depoimento
          $(`#depoimento-${index + 1} .nome-depoimento`).text(
            depoimentoData.nome
          );
          $(`#depoimento-${index + 1} .texto-depoimento span`).text(
            depoimentoData.texto
          );

          // Mostrar o depoimento na página
          $(`#depoimento-${index + 1}`).removeClass("hidden");

          cardapio.metodos.abrirDepoimento();
        });
      })
      .catch((error) => {
        console.error("Erro ao recuperar depoimentos:", error);
      });
  },

  // abre o depoimento
  abrirDepoimento: (depoimento) => {
    $("#depoimento-1").addClass("hidden");
    $("#depoimento-2").addClass("hidden");
    $("#depoimento-3").addClass("hidden");

    $("#btnDepoimento-1").removeClass("active");
    $("#btnDepoimento-2").removeClass("active");
    $("#btnDepoimento-3").removeClass("active");

    $("#depoimento-" + depoimento).removeClass("hidden");
    $("#btnDepoimento-" + depoimento).addClass("active");
  },

  // mensagens
  mensagem: (texto, cor = "red", tempo = 3500) => {
    let id = Math.floor(Date.now() * Math.random()).toString();

    let msg = `<div id="msg-${id}" class="animated fadeInDown toast ${cor}">${texto}</div>`;

    $("#container-mensagens").append(msg);

    setTimeout(() => {
      $("#msg-" + id).removeClass("fadeInDown");
      $("#msg-" + id).addClass("fadeOutUp");
      setTimeout(() => {
        $("#msg-" + id).remove();
      }, 800);
    }, tempo);
  },
};

//Gerados a partir do javascript
cardapio.templates = {
  item: `
        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <input type="hidden" id="inputImagem-\${id}" name="imagem" value="\${img}">
                <div class="img-produto">
                    <img src="\${img}" id="idImg\${id}" />
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

  itemCarrinho: `
        <div class="col-12 item-carrinho">
            <input type="hidden" id="inputImagem-\${id}" name="imagem" value="\${img}">
            <div class="img-produto">
                <img src="\${img}" id="idImg\${id}"/>
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>
    `,

  itemResumo: `
        <div class="col-12 item-carrinho resumo">
            <input type="hidden" id="inputImagem-\${id}" name="imagem" value="\${img}">
            <div class="img-produto-resumo">
                <img src="\${img}" id="idImg\${id}"/>
            </div>
            <div class="dados-produto">
                <p class="title-produto-resumo">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto-resumo">
                    <b>R$ \${preco}</b>
                </p>
            </div>
            <p class="quantidade-produto-resumo">
                x <b>\${qntd}</b>
            </p>
        </div>
    `,

  AtualizaritemCarrinho: `
        <div class="col-12 item-carrinho">
            <input type="hidden" id="inputImagem-\${id}" name="imagem" value="\${img}">
            <div class="img-produto">
                <img src="\${img}" id="idImg\${id}"/>
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>
    `,
};
