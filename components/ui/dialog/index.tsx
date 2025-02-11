/**
 * Componente Dialog - Modal de diálogo reutilizable
 * 
 * Este componente implementa un modal de diálogo accesible y personalizable que se puede usar
 * en toda la aplicación. Características principales:
 * 
 * - Accesibilidad: Implementa WAI-ARIA para lectores de pantalla
 * - Interactividad: Cierre con tecla Escape y click fuera del modal
 * - Personalización: Admite múltiples botones con variantes de estilo
 * - Seguridad: Cliente-side only ('use client')
 * 
 * @example
 * ```tsx
 * <Dialog
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmar acción"
 *   description="¿Estás seguro de que deseas realizar esta acción?"
 *   buttons={[
 *     {
 *       label: "Cancelar",
 *       onClick: () => setIsOpen(false),
 *       variant: "secondary"
 *     },
 *     {
 *       label: "Confirmar",
 *       onClick: handleConfirm,
 *       variant: "danger"
 *     }
 *   ]}
 * />
 * ```
 */

import type { DialogProps } from './types';
import { DialogClient } from './dialog-client';

export function Dialog(props: DialogProps) {
  return <DialogClient {...props} />;
}

export type { DialogProps, DialogButton } from './types';