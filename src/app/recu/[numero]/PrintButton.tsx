'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: 'white',
        color: '#f97316',
        border: 'none',
        padding: '8px 20px',
        borderRadius: '8px',
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      🖨️ Télécharger / Imprimer
    </button>
  )
}
