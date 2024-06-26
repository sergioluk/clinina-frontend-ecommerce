import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProdutoVenda } from 'src/app/interfaces/produtoVenda';
import { TabelaVendaComponent } from '../tabela-venda/tabela-venda.component';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-editar-desc-qtd',
  templateUrl: './editar-desc-qtd.component.html',
  styleUrls: ['./editar-desc-qtd.component.css']
})
export class EditarDescQtdComponent implements OnInit {
  
  @Input() listaDeProdutos: ProdutoVenda[] = [];
  @Input() index: number = 0;
  produto!: ProdutoVenda;
  formulario!: FormGroup;

  precoVenda: string | number = '';
  lucroPorCento: string | number = '';
  lucroReais: string | number = '';
  @Output() visivel = new EventEmitter();
  @Output() calcularDesconto = new EventEmitter<number>();

  constructor(
    private formBuilder: FormBuilder,
    private snackbar: SnackbarService
  ){}

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      quantidade: 0,
      desconto: 0
    });
    this.formulario.get('quantidade')?.setValue(this.listaDeProdutos[this.index].quantidade);
    this.formulario.get('desconto')?.setValue(this.listaDeProdutos[this.index].desconto);
    
    this.formulario.get('desconto')?.valueChanges.subscribe(desc => {
      this.precoVenda = this.precoDeVenda();
      this.lucroPorCento = this.calcularLucroPorCento();
      this.lucroReais = this.calcularLucroReais();
    });
    this.precoVenda = this.precoDeVenda();
    this.lucroPorCento = this.calcularLucroPorCento();
    this.lucroReais = this.calcularLucroReais();
  }

  imagemDoProduto() {
    if (this.listaVazia()) {
      return "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
    }
    let produto = this.listaDeProdutos[this.index];
    return produto.imagemP;
  }
  nomeDoProduto(){
    if (this.listaVazia()) {
      return "Sem produtos na lista";
    }
    let produto = this.listaDeProdutos[this.index];
    return produto.produto;
  }
  precoDeVenda() {
    if (this.listaVazia()) {
      return "0";
    }
    let produto = this.listaDeProdutos[this.index];
    return produto.preco - this.formulario.get('desconto')?.value;
  }
  precoDeCompraProduto() {
    if (this.listaVazia()) {
      return "0";
    }
    let produto = this.listaDeProdutos[this.index];
    return produto.precoCompra;
  }

  listaVazia(){
    if (this.listaDeProdutos.length <= 0) {
      return true;
    }
    return false;
  }

  calcularLucroPorCento() {
    if (this.listaVazia()) {
      return "0";
    }
    let produto = this.listaDeProdutos[this.index];
    if (produto.precoCompra == null) {
      return "-";
    }
    let lucro = (100 * (produto.preco - this.formulario.get('desconto')?.value) / produto.precoCompra) - 100;
    return lucro.toFixed(2);
  }

  calcularLucroReais() {
    if (this.listaVazia()) {
      return "0";
    }
    let produto = this.listaDeProdutos[this.index];
    if (produto.precoCompra == null) {
      return "-";
    }
    let lucro = (produto.preco - this.formulario.get('desconto')?.value) - produto.precoCompra;
    return lucro;
  }

  toggleJanela(){
    this.setVisivel();
  }

  aplicar() {
    let produto = this.listaDeProdutos[this.index];
    produto.quantidade = this.formulario.get('quantidade')?.value;
    produto.desconto = this.formulario.get('desconto')?.value;
    this.listaDeProdutos[this.index] = produto;
    this.calcularDesconto.emit();
    this.setVisivel();
    this.snackbar.openSnackBarSucces("Produto editado com sucesso!","Fechar");
  }
  setVisivel() {
    this.visivel.emit();
  }
  cancelar() {
    this.setVisivel();
  }

}
