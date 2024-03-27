$(document).ready(function() {
    const tabelaPedidos = $('#tabela-pedidos');
    tabelaPedidos.empty();
    const pedidosRef = db.collection('pedidos');

    pedidosRef.get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                // Se não houver pedidos, exibir uma mensagem para o usuário
                const mensagem = $('<tr>');
                mensagem.html('<td colspan="5">Não há pedidos.</td>');
                tabelaPedidos.append(mensagem);
            } else {
                querySnapshot.forEach(doc => {
                    const pedido = doc.data();
                    // Criar uma nova linha na tabela para cada pedido
                    const tr = $('<tr>');

                    tr.html(`
                        <td>${doc.id}</td>
                        <td>${pedido.itens.map(item => `${item.nome} x${item.quantidade}`).join('<br>')}</td>
                        <td>${pedido.endereco.endereco}, ${pedido.endereco.numero}<br>${pedido.endereco.bairro}<br>${pedido.endereco.cidade} - ${pedido.endereco.uf}<br>CEP: ${pedido.endereco.cep}<br>Complemento: ${pedido.endereco.complemento}<br>Nome: ${pedido.endereco.fullName}</td>
                        <td>${pedido.total}</td>
                        <td>
                            <button class="btn btn-primary editar-pedido" data-id="${doc.id}" onclick="cardapio.metodos.editarPedido('${doc.id}')">Editar</button>
                            <button class="btn btn-danger excluir-pedido" data-id="${doc.id}" onclick="cardapio.metodos.excluirPedido('${doc.id}')">Cancelar</button>
                        </td>
                    `);

                    // Adicionar a linha à tabela
                    tabelaPedidos.append(tr);
                });
            }
        })
        .catch(error => {
            console.error("Erro ao listar pedidos:", error);
            // Tratar o erro de alguma forma apropriada
        });
});
