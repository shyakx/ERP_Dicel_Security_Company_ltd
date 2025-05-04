// Initialize the page
$(document).ready(function() {
    checkAuth();
    setupEventListeners();
    loadDashboardData();
});

// Check authentication
function checkAuth() {
    if (!AuthUtils.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const user = AuthUtils.getUser();
    $('#userName').text(user.name || user.email);
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    $('#logoutBtn').on('click', function(e) {
        e.preventDefault();
        AuthUtils.logout();
    });

    // Search form
    $('.navbar-search').on('submit', function(e) {
        e.preventDefault();
        const query = $(this).find('input').val();
        if (query) {
            // TODO: Implement search functionality
            console.log('Searching for:', query);
        }
    });
}

// Load dashboard data
function loadDashboardData() {
    UiUtils.showLoading();

    // Load user data
    ApiService.get('/user/profile')
        .then(data => {
            $('#userName').text(data.name || data.email);
        })
        .catch(error => {
            console.error('Error loading user profile:', error);
        });

    // Load dashboard stats
    ApiService.get('/dashboard/stats')
        .then(data => {
            updateDashboardStats(data);
        })
        .catch(error => {
            console.error('Error loading dashboard stats:', error);
        });

    // Load earnings chart data
    ApiService.get('/dashboard/earnings')
        .then(data => {
            updateEarningsChart(data);
        })
        .catch(error => {
            console.error('Error loading earnings data:', error);
        });

    // Load revenue sources data
    ApiService.get('/dashboard/revenue')
        .then(data => {
            updateRevenueChart(data);
        })
        .catch(error => {
            console.error('Error loading revenue data:', error);
        });

    // Load projects data
    ApiService.get('/dashboard/projects')
        .then(data => {
            updateProjects(data);
        })
        .catch(error => {
            console.error('Error loading projects data:', error);
        });

    UiUtils.hideLoading();
}

// Update dashboard stats
function updateDashboardStats(data) {
    // Update monthly earnings
    $('.card.border-left-primary .h5').text(UiUtils.formatCurrency(data.monthlyEarnings));

    // Update annual earnings
    $('.card.border-left-success .h5').text(UiUtils.formatCurrency(data.annualEarnings));

    // Update tasks progress
    $('.card.border-left-info .h5').text(data.tasksProgress + '%');
    $('.card.border-left-info .progress-bar').css('width', data.tasksProgress + '%');

    // Update pending requests
    $('.card.border-left-warning .h5').text(data.pendingRequests);
}

// Update earnings chart
function updateEarningsChart(data) {
    const ctx = document.getElementById('myAreaChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Earnings',
                lineTension: 0.3,
                backgroundColor: 'rgba(78, 115, 223, 0.05)',
                borderColor: 'rgba(78, 115, 223, 1)',
                pointRadius: 3,
                pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointBorderColor: 'rgba(78, 115, 223, 1)',
                pointHoverRadius: 3,
                pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: data.values
            }]
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        callback: function(value) {
                            return '$' + value;
                        }
                    },
                    gridLines: {
                        color: 'rgb(234, 236, 244)',
                        zeroLineColor: 'rgb(234, 236, 244)',
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                backgroundColor: 'rgb(255,255,255)',
                bodyFontColor: '#858796',
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function(tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ': $' + tooltipItem.yLabel;
                    }
                }
            }
        }
    });
}

// Update revenue chart
function updateRevenueChart(data) {
    const ctx = document.getElementById('myPieChart');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
                hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
                hoverBorderColor: 'rgba(234, 236, 244, 1)'
            }]
        },
        options: {
            maintainAspectRatio: false,
            tooltips: {
                backgroundColor: 'rgb(255,255,255)',
                bodyFontColor: '#858796',
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10
            },
            legend: {
                display: false
            },
            cutoutPercentage: 80
        }
    });
}

// Update projects
function updateProjects(data) {
    const projectsContainer = $('.card.shadow.mb-4 .card-body');
    projectsContainer.empty();

    data.forEach(project => {
        const progressBar = $('<div>')
            .addClass('progress mb-4')
            .append(
                $('<div>')
                    .addClass('progress-bar')
                    .addClass(project.progressClass)
                    .attr('role', 'progressbar')
                    .attr('style', `width: ${project.progress}%`)
                    .attr('aria-valuenow', project.progress)
                    .attr('aria-valuemin', 0)
                    .attr('aria-valuemax', 100)
            );

        const projectTitle = $('<h4>')
            .addClass('small font-weight-bold')
            .text(project.name)
            .append(
                $('<span>')
                    .addClass('float-right')
                    .text(project.progress === 100 ? 'Complete!' : `${project.progress}%`)
            );

        projectsContainer.append(projectTitle, progressBar);
    });
} 