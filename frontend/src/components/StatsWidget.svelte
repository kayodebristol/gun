<script lang="ts">
  export let label: string;
  export let value: number;
  export let icon: string;
  export let color: string = 'primary';
</script>

<div class="card bg-dark border-{color} h-100">
  <div class="card-body">
    <div class="d-flex align-items-center">
      <div class="flex-shrink-0 me-3">
        <div class="bg-{color} p-2 rounded">
          <i class="bi bi-{icon}"></i>
        </div>
      </div>
      <div>
        <h6 class="text-muted mb-1">{label}</h6>
        <h3 class="mb-0">{value}</h3>
      </div>
    </div>
  </div>
</div>
