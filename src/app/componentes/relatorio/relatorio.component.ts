import { Component, ElementRef, Inject, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { CardHomeService } from '../card-home.service';
import { Router } from '@angular/router';
import { Relatorio } from '../cadastro-produto/cadastro-produto';
import jsPDF from 'jspdf';
import { IconeService } from 'src/app/services/icone.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { SnackbarService } from 'src/app/services/snackbar.service';






@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.css'],
  providers: [{
    provide: MAT_DATE_LOCALE, useValue: 'pt-BR'
  }]
})
export class RelatorioComponent implements OnInit {

  loadingSpinner = false;
  formulario!: FormGroup;
  listaDeItensVendidos: Relatorio[] = [];
  total: number = 0;

  constructor(
    private service: CardHomeService,
    private router: Router,
    private icone: IconeService,
    private formBuilder: FormBuilder,
    private _adapter: DateAdapter<any>,
    private _intl: MatDatepickerIntl,
    @Inject(MAT_DATE_LOCALE) private _locale: string,
    private snackbar: SnackbarService
  ){}

  ngOnInit(): void {

    this.formulario = this.formBuilder.group({
      start: new Date(),
      end: []
    });

    const data = this.getData();

    this.listarProdutos(data);

    //Pra fazer o Input de data ficar no formato brasileiro
    this._intl.closeCalendarLabel = "Fechar calendário";
    this._intl.changes.next();
    this._locale = 'pt-BR';
    this._adapter.setLocale(this._locale);

  }

  listarProdutos(data: {start_dia: number, start_mes: number, start_ano: number, end_dia: number, end_mes: number, end_ano: number} ) {
    this.loadingSpinner = true;
    this.service.pegarListaDeItensVendidos(data).subscribe({
      next: (response: HttpResponse<Relatorio[]>) => {
        this.listaDeItensVendidos = response.body ? response.body : [];
        this.loadingSpinner = false;
        if (this.listaDeItensVendidos.length == 0) {
          this.snackbar.openSnackBarFail("Nenhuma venda encontrada!", "Fechar");
          return;
        }
        this.snackbar.openSnackBarSucces("Vendas encontradas!","Fechar");
        this.calcularTotal();
      },
      error: (error: HttpErrorResponse) => {
        console.error("Erro: ", error.message);
        console.error("Código de status HTTP: ", error.status);
        this.snackbar.openSnackBarFail("Algo deu errado!", "Fechar");
        this.loadingSpinner = false;
      },
      complete: () => {
        console.log("Requisição completa!!!");
      }
    });
  }

  mostrarData() {
    let data = this.getData();
    let start_dia = this.formatarDigito(data.start_dia);
    let start_mes = this.formatarDigito(data.start_mes);
    let end_dia = this.formatarDigito(data.end_dia);
    let end_mes = this.formatarDigito(data.end_mes);

    let titulo = start_dia + "/" + start_mes + "/" + data.start_ano;

    if (data.end_dia > 0 || data.end_mes > 0 || data.end_ano > 0) {
      titulo = titulo + " até " + end_dia + "/" + end_mes + "/" + data.end_ano;
    }

    return titulo;
  }

  formatarDigito(numero: number) {
    return numero < 10 ? "0" + numero : numero.toString();
  }

  getData() {
    let start_dia = 0;
    let start_mes = 0;
    let start_ano = 0;
    let end_dia = 0;
    let end_mes = 0;
    let end_ano = 0;
    if (this.formulario.get("start")?.value != null) {
      start_dia = this.formulario.get("start")?.value.getDate();
      start_mes = this.formulario.get("start")?.value.getMonth() + 1;
      start_ano = this.formulario.get("start")?.value.getFullYear();
    }
    if (this.formulario.get("end")?.value != null) {
      end_dia = this.formulario.get("end")?.value.getDate();
      end_mes = this.formulario.get("end")?.value.getMonth() + 1;
      end_ano = this.formulario.get("end")?.value.getFullYear();
    }

    const data = {
      start_dia: start_dia,
      start_mes: start_mes,
      start_ano: start_ano,
      end_dia: end_dia,
      end_mes: end_mes,
      end_ano: end_ano
    }
    return data;
  }

  pesquisar() {
    this.total = 0;
    const data = this.getData();

    this.listarProdutos(data);

  }

  calcularParcial(item: Relatorio) {
    let total = 0;
    total += item.precoUnitario * item.quantidade;
    if (item.desconto) {
      total -= item.desconto;
    }
    return total;
  }

  getIcone(icone: string) {
    return this.icone.getIcone(icone);
  }

  handleImageError(event: any) {
    event.target.src = 'https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg';
  }












  calcularTotal() {
    let soma = 0;
    for (let item of this.listaDeItensVendidos) {
      soma += this.calcularParcial(item);
    }
    this.total = soma;
  }

  verificarSeFoiFracionado(peso: string) {
    if(peso == '' || peso == null){
      return false;
    }
    return true;
  }

  imprimirConteudo() {
    const conteudo = document.getElementById('conteudoParaImprimir')?.innerHTML;

    if (conteudo) {
      const janelaImpressao = window.open('', '_blank');
      //const janelaImpressao = window;
      janelaImpressao?.document.write('<html><head><title>Imprimir Conteúdo</title></head><body>');
      janelaImpressao?.document.write(conteudo);
      janelaImpressao?.document.write('</body></html>');
      janelaImpressao?.document.close();
      janelaImpressao?.print();
      /*
      // Cria uma instância do jsPDF
      const pdf = new jsPDF();
      // Adiciona o conteúdo ao PDF
      pdf.html(conteudo, {
        callback: (pdf) => {
          // Salva ou exibe o PDF
          pdf.save('relatorio.pdf');
        }
      });*/
    }
  }


}
