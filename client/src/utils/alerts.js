import Swal from 'sweetalert2';

// Configuración base para el estilo premium (Oscuro/Dorado)
const premiumSwal = Swal.mixin({
  background: '#111315',
  color: '#fff',
  confirmButtonColor: '#c9a063',
  cancelButtonColor: '#3a3e44',
  customClass: {
    popup: 'glass-card',
    title: 'heading-gold'
  }
});

const alerts = {
  success: (title, text) => {
    return premiumSwal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
      iconColor: '#c9a063'
    });
  },
  
  error: (title, text) => {
    return premiumSwal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido'
    });
  },

  confirm: (title, text) => {
    return premiumSwal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
      iconColor: '#c9a063'
    });
  },

  toast: (title, icon = 'success') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: '#1a1d21',
      color: '#fff'
    });
    return Toast.fire({
      icon,
      title
    });
  }
};

export default alerts;
