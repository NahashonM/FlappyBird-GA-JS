



function humanController() {

	// physics update
	birdPhysics(g_human)

	// draws
	drawPipes();
	drawBird(g_human);
	
	// test collisions
	let [hasCollided, hasPassedPipe] = testCollition(g_human)


	if (hasPassedPipe) {
		g_human.score++
	}

	if (hasCollided) {

	}

	let [s, h0, h1, speed] = getNearPipeRect()

	drawText( "h1: " + h1, 20, 52)
	drawText( "sp: " + speed, 20, 68)
	drawText( " s: " + s, 20, 84)
	drawText( "h0: " + h0, 20, 100)
	

	// stats
	let sx = g_ctx.measureText(g_human.score).width
	drawText( g_human.score, g_vx / 2 - sx / 2, 70, 60)

	drawText( "time: " + Math.floor(g_time) + " s", 20, 20)
	drawText( "  fps: " + Math.round(1 / g_elapsed_time), 20, 36)

	return true;
}





function geneticAlgorithmController() {

	if(!g_is_ga_ready) {
		createStartingPopulation();
		g_is_ga_ready = true;
	}

	drawPipes();

	// run generation
	let fitness_sum = 0
 	let alive_gnomes = 0
	let [s, h0, h1, v] = getNearPipeRect();

	for(let i = 0; i < g_gnome_count; i++ ){
		if(g_gnomes[i].isAlive) {
			birdPhysics( g_gnomes[i] )
			drawBird( g_gnomes[i] );

			let [isCollided, hasPassedPipe] = testCollition( g_gnomes[i] )

			if(isCollided) g_gnomes[i].isAlive = false
			else {
				alive_gnomes++

				if(hasPassedPipe)  g_gnomes[i].ga_score += g_pass_pipe_reward		// passing pipe reward
				g_gnomes[i].ga_score += g_elapsed_time / 100						// particpation reward

				let predicted_jump = predictJump(g_gnomes[i], s, h0, h1, v);		// predict jump
				if(predicted_jump) jump(g_gnomes[i])
			}
		}

		fitness_sum += g_gnomes[i].ga_score;

		// stats check
		if( g_gen_best_gnome === undefined ) g_gen_best_gnome = g_gnomes[i]
		else if (g_gen_best_gnome.ga_score <= g_gnomes[i].ga_score ) {
			g_gen_best_gnome = g_gnomes[i]
		}

	}

	g_gen_avrg_fitness = fitness_sum / g_gnome_count

	if(g_gen_avrg_fitness > g_best_generation_avrg) {
		g_best_generation_avrg = g_gen_avrg_fitness
		g_best_generation = g_generation
	}

	// if ( g_best_gnome === undefined || g_gen_best_gnome.score >= g_best_gnome.score ) {
	// 	g_best_gnome = {... g_gen_best_gnome }
	// 	g_best_gnome_generation = g_generation
	// }

	let yyy = 30
	let yyy_off = 20
	// stats
	drawText( "time: " + g_time.toFixed(0) + " s", 20, yyy,20)
	drawText( "generation: " + g_generation, 20, yyy += yyy_off, 20)
	drawText( "population: " + alive_gnomes + " / " + g_gnome_count, 20, yyy += yyy_off, 20)

	drawText( "gen. best score: " + g_gen_best_gnome.ga_score.toFixed(4), 20, yyy += yyy_off, 20)
	drawText( "gen. avrg fitness: " + g_gen_avrg_fitness.toFixed(4), 20, yyy += yyy_off, 20)

	// drawText( "all time best score: " + g_best_gnome.ga_score.toFixed(4), 20, yyy += yyy_off, 20)
	// drawText( "all time best score gen.: " + g_best_gnome_generation, 20, yyy += yyy_off, 20)

	drawText( "fittest generation: " + g_best_generation, 20, yyy += yyy_off, 20)
	drawText( "fittest generation average: " + g_best_generation_avrg.toFixed(4), 20, yyy += yyy_off, 20)

	// all gnomes dead
	if(alive_gnomes == 0) {
		generateNextGeneration()
		removeCollidedPipe()

		g_gen_best_gnome = undefined
		g_generation++
	}


	return true;
}