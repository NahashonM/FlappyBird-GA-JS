
// Genetic Algo
let g_is_ga_ready = false
let g_pass_pipe_reward = 4

let g_gnomes = undefined
let g_gnome_count = 130;

let g_gene_count = 41
let g_generation = 0

let g_gen_best_gnome = undefined;
let g_gen_avrg_fitness = 0

let g_best_gnome = undefined
let g_best_gnome_generation = 0

let g_best_generation = 0
let g_best_generation_avrg = 0

let g_parent_pool_size = 15

let g_mutation_rate = 20;		// 20% mutation rate


function createStartingPopulation() {
	g_gnomes = []

	for (let i = 0; i < g_gnome_count; i++ ) {
		let tmp = newBird();
		tmp.genes = generateRandomGenes()
		g_gnomes.push(tmp);
	}
}



function generateRandomGenes () {
	let genes = []
	for(let i = 0; i < g_gene_count; i++) { 
		genes.push( randomReal(-1, 1) ); 
	}
	return genes
}


function parentIndex(chance) {
	if (chance < 40) return 0 
	else if (chance < 65) return 1
	else if (chance < 85) return 2
	else return 3
}

function generateNextGeneration(){

	// sort gnomes based on fitness
	g_gnomes.sort( (A, B) => { return B.ga_score - A.ga_score ; } )

	let new_gnomes = []

	for(let i = 0; i < g_gnome_count; i++) {
		let chance0 = parentIndex(randomInteger(0, 100))
		let chance1 = parentIndex(randomInteger(0, 100))

		let p0, p1;
		
		p0 = ( chance0 === 3 )? randomInteger(3, g_parent_pool_size ) : chance0
		p1 = ( chance1 === 3 )? randomInteger(3, g_parent_pool_size ) : chance1

		let genes = []

		for(let j = 0; j < g_gene_count; j++ ) {
			// mutate
			let chance = randomInteger(0, 100)
			if(chance <= g_mutation_rate) {
				genes.push( randomReal(-1, 1) );
				continue;
			}

			// crossover
			let fittest = 0
			if(g_gnomes[p0] > g_gnomes[p1] ) fittest = 0
			else if(g_gnomes[p0] < g_gnomes[p1] ) fittest = 1
			else fittest = 2

			if ( fittest === 2) genes.push( g_gnomes[p1].genes[j] )
			else if ( chance > 60) {
				if(fittest === 0)  genes.push( g_gnomes[p0].genes[j] )
				else if(fittest === 1)  genes.push( g_gnomes[p1].genes[j] )
			} else {
				if(fittest === 0)  genes.push( g_gnomes[p1].genes[j] )
				else if(fittest === 1)  genes.push( g_gnomes[p0].genes[j] )
			}			
		}

		let tmp = newBird()
		tmp.genes = genes

		new_gnomes.push(tmp)
	}

	g_gnomes = undefined
	g_gnomes = new_gnomes
}


/*
*                    |___________|
*        _                 | h1
*     _ [_]           _____|_____   _
*     |    | g       |           |  |
*   h2|    v         | <-speed(v)|  | h0
*    _|_             |___________| _|
*         |----s----|
* 
*/
function predictJump(gnome, s, h0, h1, v) {

	let h2 = g_vy - (gnome.y + g_bird_sz)
	let g = g_gravity
	
	let n1 = h0*gnome.genes[0] +  h1*gnome.genes[1]  + h2*gnome.genes[2] +  s*gnome.genes[3] +  v*gnome.genes[4] +  g*gnome.genes[5] +  gnome.genes[6]
	n1 = (2 / (1 + Math.exp( -2 * n1) ) ) - 1
    
	let n2 = h0*gnome.genes[7] +  h1*gnome.genes[8]  + h2*gnome.genes[9] +  s*gnome.genes[10] + v*gnome.genes[11] + g*gnome.genes[12] + gnome.genes[13]
	n2 = (2 / (1 + Math.exp( -2 * n2) ) ) - 1
	
	let n3 = h0*gnome.genes[14] + h1*gnome.genes[15] + h2*gnome.genes[16] + s*gnome.genes[17] + v*gnome.genes[18] + g*gnome.genes[19] + gnome.genes[20]
	n3 = (2 / (1 + Math.exp( -2 * n3) ) ) - 1
	
	let n4 = h0*gnome.genes[21] + h1*gnome.genes[22] + h2*gnome.genes[23] + s*gnome.genes[24] + v*gnome.genes[25] + g*gnome.genes[26] + gnome.genes[27]
	n4 = (2 / (1 + Math.exp( -2 * n4) ) ) - 1
	
	let nn1 = n1*gnome.genes[28] + n2*gnome.genes[29] + n3*gnome.genes[30] + n4*gnome.genes[31] + gnome.genes[32]
	nn1 = (2 / (1 + Math.exp( -2 * nn1) ) ) - 1
	
	let nn2 = n1*gnome.genes[33] + n2*gnome.genes[34] + n3*gnome.genes[35] + n4*gnome.genes[36] + gnome.genes[37]
	nn2 = (2 / (1 + Math.exp( -2 * nn2) ) ) - 1
    
	let nnn1 = 1 / ( 1 + Math.exp(nn1*gnome.genes[38] + nn2*gnome.genes[39] + gnome.genes[40]) )
    
	if ( nnn1 > 0.5 ) return true
	else return false
}