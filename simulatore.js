(() => {
  const scenarios = {
    prudente: {
      label: 'prudente', deficit: 1.66, debt: 134.0, revenue: 18.7, jobs: 8400,
      impact: 3.4, deficitSeries: [2.90, 2.82, 2.56, 2.15, 1.66],
      impactParts: [1.8, 0.6, 1.0]
    },
    centrale: {
      label: 'centrale', deficit: 1.37, debt: 132.5, revenue: 38.2, jobs: 23100,
      impact: 10.8, deficitSeries: [2.88, 2.86, 2.33, 1.79, 1.37],
      impactParts: [6.1, 1.7, 3.0]
    },
    ambizioso: {
      label: 'ambizioso', deficit: 0.74, debt: 129.1, revenue: 73.4, jobs: 48800,
      impact: 26.6, deficitSeries: [2.82, 2.56, 1.78, 1.15, 0.74],
      impactParts: [14.7, 4.4, 7.5]
    }
  };
  const baseSeries = [2.90, 2.90, 2.50, 2.10, 1.80];
  let current = scenarios.centrale;

  const fmtPct = n => n.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '%';
  const fmtOne = n => n.toLocaleString('it-IT', {minimumFractionDigits: 1, maximumFractionDigits: 1});
  const fmtInt = n => Math.round(n).toLocaleString('it-IT');

  const colors = {blue:'#0b69b7', navy:'#073f74', gold:'#d1ab58', gray:'#9aaab8', green:'#167047'};
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.color = '#5b6e80';

  const deficitCtx = document.getElementById('deficit-chart');
  const deficitChart = deficitCtx ? new Chart(deficitCtx, {
    type: 'line',
    data: {
      labels: ['2026','2027','2028','2029','2030'],
      datasets: [
        {label:'Scenario base', data:baseSeries, borderColor:colors.gray, backgroundColor:'transparent', borderWidth:3, borderDash:[7,7], pointRadius:3, tension:.3},
        {label:'Con il piano', data:current.deficitSeries, borderColor:colors.blue, backgroundColor:'rgba(11,105,183,.10)', fill:true, borderWidth:4, pointRadius:4, tension:.3}
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${fmtPct(c.parsed.y)}`}}},
      scales:{x:{grid:{display:false}},y:{beginAtZero:true,suggestedMax:3.2,ticks:{callback:v=>v.toLocaleString('it-IT')+'%'},grid:{color:'#e6eef4'}}}
    }
  }) : null;

  const impactCtx = document.getElementById('impact-chart');
  const impactChart = impactCtx ? new Chart(impactCtx, {
    type:'doughnut',
    data:{labels:['Tassa: quota al deficit','Ritorno dalla redistribuzione','Nova Industria Italia'],datasets:[{data:current.impactParts,backgroundColor:[colors.navy,colors.gold,colors.blue],borderWidth:0,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom',labels:{boxWidth:12,usePointStyle:true,padding:16,font:{size:10}}},tooltip:{callbacks:{label:c=>`${c.label}: ${fmtOne(c.parsed)} mld €`}}}}
  }) : null;

  function updateKpis(s) {
    document.getElementById('scenario-name').textContent = s.label;
    document.getElementById('kpi-deficit').textContent = fmtPct(s.deficit);
    document.getElementById('kpi-deficit-delta').textContent = `−${fmtOne(1.8 - s.deficit)} punti`;
    document.getElementById('kpi-debt').textContent = fmtPct(s.debt);
    document.getElementById('kpi-debt-delta').textContent = `−${fmtOne(134.8 - s.debt)} punti`;
    document.getElementById('kpi-revenue').textContent = fmtOne(s.revenue);
    document.getElementById('kpi-jobs').textContent = fmtInt(s.jobs);
    document.getElementById('impact-total').textContent = `${fmtOne(s.impact)} mld €`;
  }

  function updateCharts(s) {
    if (deficitChart) { deficitChart.data.datasets[1].data = s.deficitSeries; deficitChart.update(); }
    if (impactChart) { impactChart.data.datasets[0].data = s.impactParts; impactChart.update(); }
  }

  function stressUpdate() {
    const taxFactor = Number(document.getElementById('tax-factor').value) / 100;
    const niiFactor = Number(document.getElementById('nii-factor').value) / 100;
    document.getElementById('tax-output').textContent = Math.round(taxFactor * 100) + '%';
    document.getElementById('nii-output').textContent = Math.round(niiFactor * 100) + '%';
    const taxContribution = current.impactParts[0] + current.impactParts[1];
    const stressedImpact = taxContribution * taxFactor + current.impactParts[2] * niiFactor;
    const stressedDeficit = Math.max(0, 1.8 - stressedImpact / 25.2);
    document.getElementById('stress-deficit').textContent = fmtPct(stressedDeficit);
    const msg = document.getElementById('stress-message');
    if (stressedDeficit <= .2) msg.textContent = 'Con queste ipotesi il bilancio si avvicina al pareggio.';
    else if (stressedDeficit < 1.5) msg.textContent = 'Il piano migliora i conti, ma non raggiunge il pareggio.';
    else if (stressedDeficit < 1.8) msg.textContent = 'Il miglioramento è limitato: il piano è molto sensibile alle ipotesi.';
    else msg.textContent = 'Con queste ipotesi il piano non migliora lo scenario base.';
  }

  document.querySelectorAll('[data-scenario]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-scenario]').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    current = scenarios[btn.dataset.scenario];
    updateKpis(current); updateCharts(current); stressUpdate();
  }));
  document.getElementById('tax-factor')?.addEventListener('input', stressUpdate);
  document.getElementById('nii-factor')?.addEventListener('input', stressUpdate);
  updateKpis(current); stressUpdate();
})();
