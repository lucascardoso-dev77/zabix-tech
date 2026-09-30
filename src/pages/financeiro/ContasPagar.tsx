import { ContasModule } from './ContasModule'

export default function ContasPagar() {
  return (
    <ContasModule
      table="contas_pagar"
      title="Contas a Pagar"
      description="Gerencie os pagamentos e vencimentos da empresa."
      partyLabel="Fornecedor"
      partyField="fornecedor"
    />
  )
}
