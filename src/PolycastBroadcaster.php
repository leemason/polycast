<?php
/**
 * Created by PhpStorm.
 * User: leemason
 * Date: 31/10/15
 * Time: 00:20
 */

namespace LeeMason\Polycast;


use Carbon\Carbon;
use Illuminate\Contracts\Broadcasting\Broadcaster;
use Illuminate\Foundation\Application;

class PolycastBroadcaster implements Broadcaster
{
    private $db = null;

    private $delete_old = 2;

    public function __construct(Application $app, $config){
        $this->db = $app['db'];
        $this->delete_old = (isset($config['delete_old'])) ? $config['delete_old'] : $this->delete_old;
    }

    public function broadcast(array $channels, $event, array $payload = []){
        //delete events older than two minutes
        $this->db->table('polycast_events')->where('created_at', '<', Carbon::now()->subMinutes($this->delete_old)->toDateTimeString())->delete();
        //insert the new event
        $this->db->table('polycast_events')->insert([
            'channels' => json_encode($channels),
            'event' => $event,
            'payload' => json_encode($payload),
            'created_at' => Carbon::now()->toDateTimeString()
        ]);
    }

}